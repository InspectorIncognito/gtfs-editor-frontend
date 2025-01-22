import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillDate, fillSelector} from "../../support/utils";

const fields = [
    "service_id"
];
const dates = [
    "date"
];
const selectors = [
    "exception_type"
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

describe("GTFS Calendar Dates creation", () => {
    it("Create Calendar Dates", () => {
        cy.mockGETDataBefore();

        cy.contains("Calendar Dates").click();
        cy.url().should("contain", "/project/1/calendardates");

        cy.contains("Add row").click();

        fillField(fields)
        fillDate(dates)
        fillSelector(selectors)

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});