const cheerio = require("cheerio");
const axios = require("axios");

// "https://www.mobileindex.com/app/get_rank_all?rt=r&mk=2&c=kr&t=game&rs=100&d=2020-01-19";

const baseUrl = "https://www.mobileindex.com/app/get_rank_all";

const defaultParams = {
  rt: "r",
  mk: 2,
  c: "kr",
  t: "game",
  rs: 100,
  d: "2020-01-19",
};

module.exports = async function crawler({ deviceValue, date }) {
  const pageData = await fetchPage({
    deviceValue,
    date,
  });
  return parseData(pageData);
};

async function fetchPage({ deviceValue, date }) {
  const response = await axios.get(baseUrl, {
    params: {
      ...defaultParams,
      mk: deviceValue,
      d: date,
    },
  });
  const { data } = response;
  return data;
}

async function parseData(pageData) {
  const $ = cheerio.load(pageData);
  const tbody = $("tbody")[0];
  return getTrs(tbody).map((tr) =>
    getTds(tr).map((td) => {
      return getName($(td));
    })
  );
}

function getTrs(tbody) {
  return tbody.children.filter((node) => {
    return node.name === "tr";
  });
}

function getTds(tr) {
  return tr.children
    .filter((node) => {
      return node.name === "td";
    })
    .slice(1);
}

function getName(td) {
  return td.find(".appname").text();
}
