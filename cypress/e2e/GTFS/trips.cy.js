import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillSelector, fillQuery} from "../../support/utils";

const fields = [
    "trip_id",
    "trip_headsign",
    "trip_short_name",
    "block_id",
];
const selectors = [
    "direction_id",
    "wheelchair_accessible",
    "bikes_allowed"
];

const queries = {
    route_id: {
        model: "routes",
        url: "/api/projects/1/routes/"
    },
    shape_id: {
        model: "shapes",
        url: "/api/projects/1/shapes/"
    },
    service_id: {
        model: "services",
        url: "/api/projects/1/services/"
    },
};


before(() => {
    cy.login();
});

beforeEach(() => {
    cy.createGTFS();
    cy.postGTFSData();
    cy.visit("/myprojects");
    cy.contains(TEST_GTFS_NAME).click();
})

describe("GTFS Trips creation", () => {
    it("Create Trips", () => {
        cy.mockGETDataBefore();
        cy.mockTablesForData("cypress_test_gtfs/tablesTrips.json");

        cy.reload();

        cy.contains("Trips").click();
        cy.url().should("contain", "/project/1/trips");

        cy.contains("Add row").click();

        fillField(fields);
        fillSelector(selectors);
        fillQuery(queries);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});