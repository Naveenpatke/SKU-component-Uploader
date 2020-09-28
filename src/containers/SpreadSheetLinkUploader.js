import React, { Component } from 'react'
import { Input, Button, List, Skeleton, message, Tooltip } from 'antd';
import { StackingLayout } from 'prism-reactjs';
import {componentDetailsFormat} from '../utils/ComponetDetailsFormat';
import '../App.css';

class SpreadSheetLinkUploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: ''
        }
    }

    /*
    * onAdd - this handler is used to add the new spreadsheet list into list via onAdd prop function
    * and clears the input field 
    */
    onAdd = () => {
        this.props.onAdd(this.state.inputText);
        this.setState({ inputText: '' });
    }

    /*
    * uploadSpreadsheetData - this handler is used to display the data related to all the spreadsheets being uploaded 
    */
    uploadSpreadsheetData = () => {
        var componentsToAdd = [];
        console.log("Spreadsheets Data - ", this.props.SpreadsheetsDataObject);
        Object.keys(this.props.SpreadsheetsDataObject).map((spreadsheetID, index)=> {
            var tempComponentObjectsArray = [];
            tempComponentObjectsArray = componentDetailsFormat(this.props.SpreadsheetsDataObject[spreadsheetID], 'Naveen');
            componentsToAdd = [...componentsToAdd, ...tempComponentObjectsArray];
        })
        message.success("Upload Successful");
        console.log("Spreadsheets Data converted to component Data Object - ", componentsToAdd);
        this.props.onClear();
    }

    render() {
        return (
            <div>
                <div style={{ margin: '10px' }}>
                    <h3>Spreadsheet Link:</h3>
                    <Input
                        className='inputField'
                        placeholder='Spreadsheet Link'
                        type='text' value={this.state.inputText}
                        onChange={(e) => this.setState({ inputText: e.target.value })}
                        onPressEnter={this.onAdd}
                    />
                    <div className="button">
                        <Button onClick={this.props.onClear} style={{ marginRight: '10px' }}>Clear All</Button>
                        <Tooltip title={this.state.inputText.length === 0 ? 'Add Link to enable' : 'Add Link'}>
                            <Button type="primary" style={{ marginRight: '10px' }} onClick={this.onAdd}
                                disabled={this.state.inputText.length === 0}>Add</Button>
                        </Tooltip>
                        <Tooltip title={this.props.SpreadsheetLinks.length === 0 ? 'Add Links to enable' : 'Upload'}>
                            <Button type="primary" onClick={this.uploadSpreadsheetData}
                                disabled={this.props.SpreadsheetLinks.length === 0}>Upload</Button>
                        </Tooltip>
                    </div>
                </div>
                <StackingLayout>
                    <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        dataSource={this.props.SpreadsheetLinks}
                        bordered
                        renderItem={item => (
                            <List.Item
                                actions={[<a href={item} target="_blank" rel="noopener noreferrer" key={item} >Open</a>]}
                            >
                                <Skeleton avatar title={false} loading={false} active>
                                    <List.Item.Meta
                                        title={<a href={item} target="_blank" rel="noopener noreferrer">sheet - {item.substring(39, 46)}</a>}
                                    />
                                </Skeleton>
                            </List.Item>
                        )}
                    />
                </StackingLayout>
            </div>
        )
    }
}


export default SpreadSheetLinkUploader;