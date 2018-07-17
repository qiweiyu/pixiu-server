'use strict';

const { app } = require('egg-mock/bootstrap');
const robotName = 'robotWenzhawenda';
const beginRunningTime = (new Date('2018-03-01UTC')).getTime();
const endRunningTime = Date.now();

describe('robot', () => {
  let house;
  before(() => {
    const ctx = app.mockContext();
    house = ctx.service.houseMock;
  });
  it(`run ${robotName}`, async () => {
    const ctx = app.mockContext();
    const robot = ctx.service[robotName];
    await house.init({
      fee: 0.002,
      currentPosTime: beginRunningTime,
      beginMoney: 10000,
      beginAmount: 0,
    });
    let lastInfo = await robot.init(house);
    let running = false;
    do {
      const nextData = await robot.house.fetchNext();
      const time = nextData.time;
      const price = nextData.price;
      lastInfo = await robot.tickHandler(time, price, lastInfo);
      console.log(await house.fetchAccount());
      running = time < endRunningTime;
    } while (running);
  });
});
