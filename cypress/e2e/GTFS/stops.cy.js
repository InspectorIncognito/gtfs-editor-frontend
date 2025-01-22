import {TEST_GTFS_NAME} from "../../support/utils";
import {fillField, fillNumber, fillSelector, fillQuery} from "../../support/utils";

const fields = [
    "stop_id",
    "stop_code",
    "stop_name",
    "stop_url",
    "stop_desc",
    "zone_id",
    "location_type",
    "stop_timezone",
    "platform_code"
];

const numbers = [
    "stop_lat",
    "stop_lon",
];

const selectors = [
    "wheelchair_boarding",
];

const queries = {
    parent_station_id: {
        model: "stops",
        url: "/api/projects/1/stops/"
    },
    level_id: {
        model: "levels",
        url: "/api/projects/1/levels/"
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

describe("GTFS Stops creation", () => {
    it("Create Stops", () => {
        cy.mockGETDataBefore();

        cy.contains("Stops").click();
        cy.url().should("contain", "/project/1/stops");

        cy.contains("Table view").click();
        cy.contains("Add row").click();

        fillField(fields);
        fillNumber(numbers);
        fillSelector(selectors);
        fillQuery(queries);

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});