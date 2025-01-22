import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillQuery} from "../../support/utils";


const fields = [
    "destination_id",
    "contains_id"
];

const queries = {
    fare_id: {
        model: "fareattributes",
        url: "/api/projects/1/fareattributes/"
    },
    route_id: {
        model: "routes",
        url: "/api/projects/1/routes/"
    },
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
        cy.mockTablesForData("cypress_test_gtfs/tablesFareRules.json");

        cy.contains("Fare Rules").click();
        cy.url().should("contain", "/project/1/farerules");
        cy.contains("Add row").click();

        fillField(fields);
        fillQuery(queries);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});