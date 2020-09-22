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
            return accessToken
        } catch (err) {
            throw new Error(genericMessage);
        }
    }
}

export class GoogleApiServices {

    formatSheetData = (sheetData) => {
        const sheetDataObject = {};
        const {values} = sheetData;
        const columnName = values[0];
        for(var i=1; i< values.length; i++){
            var result = values[i].reduce((result, cellData, index) => {
                result[columnName[index]] = cellData;
                return result;
            }, {});
            sheetDataObject[result["ProductCode"]] = result;
        }
        return sheetDataObject;
    }

    getSpreadsheetData = async (spreadsheetLink, accessToken) => {
        const spreadsheetId = spreadsheetLink.match(regex)[1];
        const range = "A1:Z"
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,{
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json())
        .then(async(sheetData) => {
            const sheetDataObject = await this.formatSheetData(sheetData);
            const tempDataObject = {};
            tempDataObject[spreadsheetId] = sheetDataObject;
            console.log("tempDataObject", tempDataObject);
            return tempDataObject;
            //this.setState({spreadsheetsDataObject: {...this.state.spreadsheetsDataObject, ...tempDataObject}});
        });
    }
}