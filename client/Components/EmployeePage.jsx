import React, { Component } from 'react';
import ClockIn from './ClockIn.jsx';
import ClockOut from './ClockOut.jsx';

class EmployeePage extends Component {
  constructor(props) {
    super(props);
    /**
     * NOTE: we can use state in this child component because
     *       it is state that is specific to only this component
     *       and does not need to be accessible to parent and / or
     *       sibling components.
     */
    this.state = {
      currentTime: '',
      currentAction: '',
      error: '',
    };
    this.toggleClockIn = this.toggleClockIn.bind(this);
    this.getTime = this.getTime.bind(this);
    this.revealClockProof = this.revealClockProof.bind(this);
  }

  render() {
    return (
      <section id='employeePageBox'>
        <section id='welcomeMessage'>Hello, Insert Employee Name Here</section>
        <section id='hoursWorked'>You've worked ___ hours this week</section>
        <section id='clockProof'>
          You {this.state.currentAction} at {this.state.currentTime}
        </section>
        <section id='timeButtonParent'>
          <ClockIn toggleClockIn={this.toggleClockIn} />
          <ClockOut toggleClockIn={this.toggleClockIn} />
        </section>
      </section>
    );
  }

  toggleClockIn(e) {
    console.log('target', e.target.id);
    let action;
    let error;
    if (e.target.id === 'clockInButton') {
      if (this.state.currentAction !== 'clocked in') {
        action = 'clocked in';
      } else {
        error = 'you already clocked in';
      }
    } else {
      if (this.state.currentAction !== 'clocked out') {
        action = 'clocked out';
      } else {
        error = 'you already clocked out';
      }
    }
    const time = this.getTime();
    this.setState({ currentTime: time, currentAction: action, error });
    this.revealClockProof('block');
  }

  getTime() {
    const date = new Date();
    const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const seconds =
      date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    const minutes =
      date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const time = `${hours}:${minutes}:${seconds}`;
    return time;
  }

  revealClockProof(display) {
    const clockProof = document.getElementById('clockProof');
    clockProof.style.display = display;
    setTimeout(revealClockProof('none'), 1000);
    return;
  }
}

// on component did mount, query the database to get hours worked that week

export default EmployeePage;
