import React, { Component } from 'react'
import { Input, Button, List, Skeleton } from 'antd';
import { StackingLayout } from 'prism-reactjs';
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

    uploadSpreadsheetData = () => {
        console.log("Spreadsheets Data - ",this.props.SpreadsheetsDataObject);
    }

    render() {
        return (
            <div>
                <div style={{margin: '10px'}}>
                    <h3>Spreadsheet Link:</h3>
                    <Input 
                        className='inputField'
                        placeholder='Spreadsheet Link'
                         type='text' value={this.state.inputText} 
                         onChange={(e) => this.setState({ inputText: e.target.value })} 
                    />
                    <div className="button">
                        <Button onClick={this.props.onClear} style={{ marginRight: '10px' }}>Clear All</Button>
                        <Button type="primary" onClick={this.onAdd} disabled={this.state.inputText.length === 0}>Add</Button>
                        <Button onClick={this.uploadSpreadsheetData}>Upload</Button>
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