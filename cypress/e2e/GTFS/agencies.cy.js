import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillSelector} from "../../support/utils";


const fields = [
    "agency_id",
    "agency_name",
    "agency_url",
    "agency_lang",
    "agency_phone",
    "agency_fare_url",
    "agency_email",
];

const selectors = ["agency_timezone"];

before(() => {
    cy.login();
});

beforeEach(() => {
    cy.createGTFS();
    cy.postGTFSData();
    cy.visit("/myprojects");
    cy.contains(TEST_GTFS_NAME).click();
})

describe("GTFS Agencies creation", () => {
    it("Create Agencies", () => {
        cy.mockGETDataBefore();

        cy.contains("Agencies").click();
        cy.url().should("contain", "/project/1/agencies");

        cy.contains("Add row").click();

        fillField(fields);
        fillSelector(selectors);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});