import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillDate, fillDay} from "../../support/utils";

const fields = [
    "service_id",
];
const dates = [
    "start_date",
    "end_date"
]
const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

before(() => {
    cy.login();
});

beforeEach(() => {
    cy.createGTFS();
    cy.postGTFSData();
    cy.visit("/myprojects");
    cy.contains(TEST_GTFS_NAME).click();
})

describe("GTFS Calendars creation", () => {
    it("Create Calendars", () => {
        cy.mockGETDataBefore();

        cy.contains("Calendars").click();
        cy.url().should("contain", "/project/1/calendars");

        cy.contains("Add row").click();

        fillField(fields);
        fillDate(dates);
        fillDay(days)

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});