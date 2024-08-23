import { Client, Account, Databases } from "appwrite";

export const projectId = "66c789d800349fbf6bb5"
export const dbId = "core"
export const messageCollectionId = "66c793d400210d922ad1"

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('66c789d800349fbf6bb5'); // Your project ID

export const account = new Account(client);
export const db = new Databases(client)

export default client