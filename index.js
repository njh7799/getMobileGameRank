const { isTomorrow, addDays, format } = require("date-fns");
const Excel = require("exceljs");

const crawler = require("./crawler");

const DEVICE_TYPE = {
  IOS: "IOS",
  ANDROID: "ANDROID",
};

const DEVICE_VALUE = {
  IOS: 1,
  ANDROID: 2,
};
const GAME_NAME = {
  메이플스토리M: "메이플스토리M",
  V4: "V4",
};

const worksheetColumns = [
  { header: "날짜", key: "date" },
  { header: "OS", key: "deviceType" },
  { header: "게임 이름", key: "gameName" },
  { header: "무료 순위", key: "freeRank" },
  { header: "매출 순위", key: "salesRank" },
];

getResult();

async function getResult() {
  const workbook = new Excel.Workbook();
  await getRankHistory({
    deviceType: DEVICE_TYPE.IOS,
    startDate: "2016-10-13",
    gameName: GAME_NAME.메이플스토리M,
    workbook,
  });
  await getRankHistory({
    deviceType: DEVICE_TYPE.ANDROID,
    startDate: "2016-10-13",
    gameName: GAME_NAME.메이플스토리M,
    workbook,
  });
  await getRankHistory({
    deviceType: DEVICE_TYPE.IOS,
    startDate: "2019-11-07",
    gameName: GAME_NAME.V4,
    workbook,
  });
  await getRankHistory({
    deviceType: DEVICE_TYPE.ANDROID,
    startDate: "2019-11-07",
    gameName: GAME_NAME.V4,
    workbook,
  });
  workbook.xlsx.writeFile("gameRankHistory.xlsx");
}

async function getRankHistory({ deviceType, startDate, gameName, workbook }) {
  const worksheet = workbook.addWorksheet(`${gameName}-${deviceType}`);
  worksheet.columns = worksheetColumns;

  let date = new Date(startDate);
  while (!isTomorrow(date)) {
    const rank = await getRank({
      deviceType,
      date: format(date, "yyyy-MM-dd"),
      gameName,
    });
    worksheet.addRow(rank);
    date = addDays(date, 1);
  }
}

async function getRank({ deviceType, date, gameName }) {
  const data = await crawler({
    deviceValue: DEVICE_VALUE[deviceType],
    date,
  });
  const { freeRanks, salesRanks } = getRanks(data);
  const freeRank = freeRanks.findIndex((game) => game === gameName) + 1;
  const salesRank = salesRanks.findIndex((game) => game === gameName) + 1;
  return { deviceType, gameName, date, freeRank, salesRank };
}

function getRanks(data) {
  const freeRanks = [];
  const salesRanks = [];
  data.forEach((games) => {
    freeRanks.push(games[0]);
    salesRanks.push(games[2]);
  });
  return { freeRanks, salesRanks };
}
