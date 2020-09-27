import serviceCred from './../credentials.json';
import jwt from 'jsonwebtoken';
import * as moment from 'moment';
import axios from 'axios';

// regex to extract spreadsheetId from google spreadsheet Link
const regex = '/spreadsheets/d/([a-zA-Z0-9-_]+)';

/*
* GoogleApiConnector - This class is used to build a connection between the application and the google Api server
*/
export class GoogleApiConnector {

    getJWTToken = (payload) => {
        const GOOGLE_JWT_PRIVATE_KEY = serviceCred.private_key;
        return jwt.sign(payload, GOOGLE_JWT_PRIVATE_KEY, { algorithm: 'RS256' });
    }

    /*
    * connect - this handler is used to connect to googleApi
    * @return {String} - It return accessToken
    */
    connect = async () => {
        const genericMessage =
            'Error while getting access token';
        const claimSet = {
            iss: serviceCred.client_email,
            scope: 'https://www.googleapis.com/auth/drive',
            aud: serviceCred.token_uri,
            exp: parseInt(moment().add(2, 'minutes').format('X'), 10),
        };
        const jwtToken = this.getJWTToken(claimSet);
        const postPayload = {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwtToken,
        };
        try {
            const response = await axios({
                method: 'post',
                url: 'https://oauth2.googleapis.com/token',
                data: postPayload,
                headers: {},
            });

            const accessToken = response.data.access_token;
            if (!accessToken) {
                throw new Error(genericMessage);
            }
            document.cookie = `accessToken=${accessToken}`;
        } catch (err) {
            throw new Error(genericMessage);
        }
    }
}

export class GoogleApiServices {
    /*
    * formatSheetData - this handler is used to format the given rows data into proper key value pair,
    *                   column name with the cell data
    * @param {ArrayOfArray} - sheetData - It contains row data inside an array
    * @return {object} - key value pair of column name with cell data
    */
    formatSheetData = (sheetData) => {
        const sheetDataObject = {};
        const { values } = sheetData;
        const columnName = values[0];
        for (var i = 1; i < values.length; i++) {
            var result = values[i].reduce((result, cellData, index) => {
                result[columnName[index]] = cellData;
                return result;
            }, {});
            sheetDataObject[result["External_ID__c"]] = result;
        }
        return sheetDataObject;
    }

    /*
    * getSheetName - this handler is used to fetch sheetTitle of the given spreadsheet
    * @param {String} - spreadsheetId - It contains Spreadsheet ID
    * @param {String} - accessToken 
    * @return {String} - first sheet title of the given spreadsheet Id
    */
    getSheetName = async (spreadsheetId, accessToken) => {

        const response = await axios({
            method: 'GET',
            url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            }
        })
        const spreadsheetDetails = await response.data;
        var sheetTitle = spreadsheetDetails.sheets[0].properties.title;
        //console.log("sheetTitle", sheetTitle);
        return sheetTitle;
    }

    /*
    * getSpreadsheetData - this handler is used to fetch first sheet data for the given spreadsheet link
    * @param {String} - spreadsheetLink - It contains Spreadsheet Link
    * @param {String} - accessToken 
    * @return {Object} - object consist of data related to the entire spreadsheet in key-value pair
    *                     key - spreadsheet Id, value - row data of the given spreadsheet in key value pair
    */
    getSpreadsheetData = async (spreadsheetLink, accessToken) => {
        const spreadsheetId = spreadsheetLink.match(regex)[1];
        const sheetTitle = await this.getSheetName(spreadsheetId, accessToken);

        const response = await axios({
            method: 'GET',
            url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        });

        const sheetData = response.data;
        const sheetDataObject = await this.formatSheetData(sheetData);
        const tempDataObject = {};
        tempDataObject[spreadsheetId] = sheetDataObject;
        return tempDataObject;
    }
}