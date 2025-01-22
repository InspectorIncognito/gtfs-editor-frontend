import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillNumber, fillSelector, fillQuery} from "../../support/utils";


const fields = [
    "fare_id",
    "currency_type"
];

const numbers = [
    "price",
    "transfer_duration"
];

const selectors = [
    "payment_method",
    "transfers"
];

const queries = {
    agency_id: {
        model: "agencies",
        url: "/api/projects/1/agencies/"
    }
}


before(() => {
    cy.login();
});

beforeEach(() => {
    cy.createGTFS();
    cy.postGTFSData();
    cy.visit("/myprojects");
    cy.contains(TEST_GTFS_NAME).click();
})

describe("GTFS Fare Attributes creation", () => {
    it("Create Fare Attributes", () => {
        cy.mockGETDataBefore();

        cy.contains("Fare Attributes").click();
        cy.url().should("contain", "/project/1/fareattributes");

        cy.contains("Add row").click();

        fillField(fields);
        fillNumber(numbers)
        fillSelector(selectors);
        fillQuery(queries);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});