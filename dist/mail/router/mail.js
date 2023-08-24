"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mail_controller_1 = __importDefault(require("../controller/mail.controller"));
const mail = (0, express_1.Router)();
mail.post("/", mail_controller_1.default);
exports.default = mail;
