import React from 'react';
import './App.css';
import SpreadSheetLinkUploader from './containers/SpreadSheetLinkUploader';
//import GoogleSpreadsheetUploader from './containers/GoogleSpreadsheetUploader';
import { GoogleApiConnector, GoogleApiServices } from './containers/GoogleSheetServiceApi';
import 'antd/dist/antd.css';
import { message, Alert } from 'antd';
import UploadExcel from './containers/UploadExcel';

// regex to extract spreadsheetId from google spreadsheet Link
const regex = '/spreadsheets/d/([a-zA-Z0-9-_]+)';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      SpreadsheetLinks: [],
      spreadsheetsDataObject: {},
      loader: false,
      error: false
    }
  }

  componentDidMount() {
    const googleApiConnector = new GoogleApiConnector();
    googleApiConnector.connect();
    setInterval(function () {
      const googleApiConnector = new GoogleApiConnector();
      googleApiConnector.connect();
    }, 100000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.loader) {
      message.loading('Action in progress', 1.4);
    }
    if (prevState.SpreadsheetLinks.length + 1 === this.state.SpreadsheetLinks.length) {
      message.success("Loading Successful", 1.0);
    }
  }

  componentWillUnmount(){
    document.cookie= "accessToken=";
  }

  /* 
  * getCookie - this handler is used to retrieve accessToken from the browsers cookies
  * @param {String} - cname - cookie name
  */
  getCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  /* 
  * onAdd - this handler is used to add the new input value into the list
  * @param {String}
  */
  onAdd = async (link) => {
    try {
      // To check whether the given spreadsheet link is whether valid
      if (!link.match(regex)) {
        throw new Error('Invalid link');
      }
      else {
        this.setState({ loader: true, error: false });
        const accessToken = this.getCookie("accessToken");

        const googleApiServices = new GoogleApiServices();
        const spreadsheetDataObject = await googleApiServices.getSpreadsheetData(link, accessToken);

        const tempList = [link, ...this.state.SpreadsheetLinks];
        const tempSpreadsheetObject = { ...this.state.spreadsheetsDataObject, ...spreadsheetDataObject }
        this.setState({
          SpreadsheetLinks: tempList,
          spreadsheetsDataObject: tempSpreadsheetObject,
          loader: false
        });
      }
    } catch (err) {
      this.setState({ error: true, loader: false });
    }
  };

  /*
  * onDelete - this handler is used
  */
  onDelete = e => {
    console.log(e);
  }

  /*
  * onCLear - this handler is used clear all the entries in to SpreadsheetLinks list
  */
  onClear = () => {
    this.setState({ SpreadsheetLinks: [], spreadsheetsDataObject: {} });
  }

  render() {
    return (
      <div className="App">
        {/* <GoogleSpreadsheetUploader SpreadsheetLinks={this.state.SpreadsheetLinks} onClear={this.onClear}/> */}
        {this.state.error ? <Alert
          message="Alert message"
          description="Given Spreadsheet link is either invalid or you dont have permission to access this spreadsheet."
          type="error" />
          : ''}
        <SpreadSheetLinkUploader
          onAdd={this.onAdd}
          onDelete={this.onDelete}
          SpreadsheetLinks={this.state.SpreadsheetLinks}
          onClear={this.onClear}
          SpreadsheetsDataObject={this.state.spreadsheetsDataObject}
        />
        <br/>
        <UploadExcel />
      </div>
    );

  }
}

export default App;