import fetch from "node-fetch";
import $ from "cheerio";
import * as dotenv from "dotenv";
import Twilio from "twilio";
dotenv.config();

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const PHONE_NUMBERS = process.env.PHONE_NUMBERS.split(",");
const URL = "https://ucngame.com/codes/uno-mobile-gift-code/";

var lastListOfCodes = [];

async function Main() {
  lastListOfCodes = await FetchForList();

  setInterval(async () => {
    console.log("Fetching for CODES!")
    const newList = await FetchForList;

    if (newList == lastListOfCodes) return console.log("No new CODES!");
    console.log("New CODES!")

    const diference = newList.filter((x) => !lastListOfCodes.includes(x));
    lastListOfCodes = newList;

    sendSmsToNumbers(PHONE_NUMBERS, diference);
  }, 300000);
}

async function FetchForList() {
  const html = await fetch(URL).then((res) => res.text());

  const trList = $("tbody > tr", html);

  const listOfCodes = [];
  for (let x = 0; x < trList.length; x++) {
    listOfCodes.push(trList[x].firstChild.firstChild.firstChild.data);
  }

  return listOfCodes;
}

function sendSmsToNumbers(numbers = [], codes) {
  for (let x = 0; x < numbers.length; x++) {
    sendSms(numbers[x], codes);
  }
}

function sendSms(number, codes = []) {
  const MSG = `New Uno CODES! ${codes}`;
  console.log(MSG);

  client.messages
    .create({
      body: MSG,
      from: process.env.TWILIO_NUMBER,
      to: number,
    })
    .then((message) => console.log(message.sid));
}

Main();
