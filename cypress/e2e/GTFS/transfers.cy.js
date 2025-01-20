import {TEST_GTFS_NAME} from "../../support/utils";
import {fillNumber, fillSelector, fillQuery} from "../../support/utils";


const numbers = [
    "min_transfer_time"
];

const selectors = [
    "type"
];

const queries = {
    from_stop_id: {
        model: "stops",
        url: "/api/projects/1/stops/"
    },
    to_stop_id: {
        model: "stops",
        url: "/api/projects/1/stops/"
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

describe("GTFS Transfers creation", () => {
    it("Create Transfers", () => {
        cy.mockGETDataBefore();
        cy.mockTablesForData("cypress_test_gtfs/tablesTransfers.json");

        cy.reload();
        cy.contains("Transfers").click();
        cy.url().should("contain", "/project/1/transfers");

        cy.contains("Add row").click();

        fillNumber(numbers)
        fillSelector(selectors);
        fillQuery(queries);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});