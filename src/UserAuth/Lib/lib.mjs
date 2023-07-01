import Datastore from "nedb";
const database = new Datastore("user.db");
const loadDatastore = database.loadDatabase();

export default {
    database,
    loadDatastore,
}