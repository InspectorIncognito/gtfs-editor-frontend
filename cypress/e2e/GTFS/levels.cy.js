import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillNumber} from "../../support/utils";

const fields = [
    "level_id",
    "level_name"
];

const numbers = [
    "level_index"
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

describe("GTFS Levels creation", () => {
    it("Create Levels", () => {
        cy.mockGETDataBefore();

        cy.contains("Levels").click();
        cy.url().should("contain", "/project/1/levels");
        cy.contains("Add row").click();

        fillField(fields);
        fillNumber(numbers);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});