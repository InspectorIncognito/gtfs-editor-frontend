import {TEST_GTFS_NAME} from "../../support/utils";
import {fillNumber, fillSelector, fillTime, fillQuery} from "../../support/utils";

const numbers = [
    "headway_secs",
];
const selectors = [
    "exact_times"
];

const times = [
    "start_time",
    "end_time"
];

const queries = {
    trip_id: {
        model: "trips",
        url: "/api/projects/1/trips/"
    }
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

describe("GTFS Frequencies creation", () => {
    it("Create Frequencies", () => {
        cy.mockGETDataBefore();
        cy.mockTablesForData("cypress_test_gtfs/tablesFrequencies.json");

        cy.reload();

        cy.contains("Frequencies").click();
        cy.url().should("contain", "/project/1/frequencies");

        cy.contains("Add row").click();

        fillNumber(numbers);
        fillTime(times);
        fillSelector(selectors);
        fillQuery(queries)

        cy.mockGETDataAfter();

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
});