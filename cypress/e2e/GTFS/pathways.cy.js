import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillSelector, fillQuery, fillClick} from "../../support/utils";

const fields = [
    "pathway_id"
];


const selectors = [
    "pathway_mode"
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

const click = [
    "is_bidirectional"
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

describe("GTFS Pathways creation", () => {
    it("Create Pathways", () => {
        cy.mockGETDataBefore();
        cy.mockTablesForData("cypress_test_gtfs/tablesPathways.json");

        cy.reload();
        cy.contains("Pathways").click();
        cy.url().should("contain", "/project/1/pathways");

        cy.contains("Add row").click();

        fillField(fields);
        fillSelector(selectors);
        fillQuery(queries);
        fillClick(click);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});