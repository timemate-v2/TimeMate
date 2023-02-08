const db = require('../models/timeMateModels.js');

const employeeController = {};

Date.prototype.getWeek = function (dowOffset) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
  
    dowOffset = typeof dowOffset == 'number' ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = day >= 0 ? day : day + 7;
    var daynum =
      Math.floor(
        (this.getTime() -
          newYear.getTime() -
          (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
          86400000
      ) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if (day < 4) {
      weeknum = Math.floor((daynum + day - 1) / 7) + 1;
      if (weeknum > 52) {
        nYear = new Date(this.getFullYear() + 1, 0, 1);
        nday = nYear.getDay() - dowOffset;
        nday = nday >= 0 ? nday : nday + 7;
        /*if the next year starts before the middle of
                  the week, it is week #1 of that year*/
        weeknum = nday < 4 ? 1 : 53;
      }
    } else {
      weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
  };


employeeController.getDate = (req, res, next) => {
    const { date, emp_id, time } = req.body;


  const dateStr = date.split('T')[0];

  const dateArr = dateStr.split('-');

  console.log(dateArr);

  const numDate = new Date(
    Number(dateArr[0]),
    Number(dateArr[1]) - 1,
    Number(dateArr[2])
  );

  const weekNumber = numDate.getWeek();

  res.locals.timestamp = date;
  res.locals.emp_id = emp_id;
  res.locals.week = weekNumber;

  return next();
}

employeeController.clockIn = (req, res, next) => {
    const emp_id = res.locals.emp_id;
    const timestamp = res.locals.timestamp;
    console.log('timestamp', timestamp);
    const week = res.locals.week;
    const time = new Date(timestamp)
    //console.log('specific time at timestamp:', ((time.getTime() / 1000)/3600))
    //sequel query to insert that info into timesheet table
    //sequel query to get entry_id of row just created
    //save entry_id to res.locals.entry_id

    const queryText = 'INSERT INTO timesheet (clock_in, week, emp_id) VALUES (($1), ($2), ($3)) RETURNING entry_id;';
    const values = [timestamp, week, emp_id];

    db.query(queryText, values)
    .then((response) => {
        //console.log(response);
        //console.log('this is the entry id:', response.rows[0].entry_id);
        res.locals.entry_id = response.rows[0].entry_id;
        const queryText2 = 'SELECT clock_in FROM timesheet;';
        db.query(queryText2)
        .then((response) => {
            console.log('looking for clock_in', response.rows);
        })
        .catch((err) => {
            return next({
                message: 'err in employee controller clockIn'
            })
        })
        return next();
    })
    .catch((err) => {
        return next({
            message: 'err in employee controller clockIn'
        })
    })
}

employeeController.clockOut = (req, res, next) => {

}

//select employee_type from all_employees where username='workermcgee' and password='worker'
//to login
    //query all_employees table for a username and password matching the ones 
    //if successful, return {Success: Worker}/{Success:Manager, first_name: }
    //if unsuccessful, return {error: 'failed login attempt'}

employeeController.authorize = (req, res, next) => {
    // get variables from req.body
    const {username, password} = req.body;
    // define query text
    const queryText = 'SELECT employee_type, first_name, emp_id FROM all_employees WHERE username=($1) AND password=($2);';
    const values = [username, password];
    // query DB to find password with given username
    db.query(queryText, values)
    // .then either return success or return error
    .then((response) => {
        //console.log(response);
        if (response.rows.length) {
          res.locals.user = response.rows[0]
          res.locals.user.Success = response.rows[0].employee_type
          //console.log(res.locals.user);
          return next()
        } else {
        // frontend will check if response.rows is empty
          res.locals.user = {error: 'failed login attempt'};
          return next();
        }
    })
    // .catch return error
    .catch((err) => {
        return next({
            message: 'err in employee controller authorize',
        })
    })
}
module.exports = employeeController;