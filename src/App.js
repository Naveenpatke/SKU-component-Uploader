import React from 'react';
import './App.css';
import SpreadSheetLinkUploader from './containers/SpreadSheetLinkUploader';
//import GoogleSpreadsheetUploader from './containers/GoogleSpreadsheetUploader';
import { GoogleApiConnector, GoogleApiServices } from './containers/GoogleSheetServiceApi';
import 'antd/dist/antd.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      SpreadsheetLinks: [],
      spreadsheetsDataObject: {},
      loader: false
    }
  }

  /* 
  * onAdd - this handler is used to add the new input value into the list
  * @param {String}
  */
  onAdd = async (link) => {

    const googleApiConnector = new GoogleApiConnector();
    const accessToken = await googleApiConnector.connect();

    const googleApiServices = new GoogleApiServices();
    const spreadsheetDataObject = await googleApiServices.getSpreadsheetData(link, accessToken);
    
    const tempList = [link, ...this.state.SpreadsheetLinks];
    const tempSpreadsheetObject = { ...this.state.spreadsheetsDataObject, ...spreadsheetDataObject }
    this.setState({
      SpreadsheetLinks: tempList,
      spreadsheetsDataObject: tempSpreadsheetObject
    });

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
    console.log(this.state.spreadsheetsDataObject)
    this.setState({ SpreadsheetLinks: [] });
    console.log("Cleared Data");
  }

  render() {
    return (
      <div className="App" >
        {/* <GoogleSpreadsheetUploader SpreadsheetLinks={this.state.SpreadsheetLinks} onClear={this.onClear}/> */}
        <SpreadSheetLinkUploader
          onAdd={this.onAdd}
          onDelete={this.onDelete}
          SpreadsheetLinks={this.state.SpreadsheetLinks}
          onClear={this.onClear}
          SpreadsheetsDataObject={this.state.spreadsheetsDataObject}
        />
      </div>
    );

  }
}

export default App;