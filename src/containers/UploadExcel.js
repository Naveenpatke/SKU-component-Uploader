import React, { Component } from 'react'
import { Upload, Button, Modal, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import readXlsxFile from 'read-excel-file';
import {componentDetailsFormat} from '../utils/ComponetDetailsFormat';

const { Dragger } = Upload;
export default class UploadExcel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploadModelVisible: false,
            uploadExcelField: {
                name: "file",
                accept: ".xlsx",
                multiple: true,
                showUploadList: { showRemoveIcon: false },
                onChange: this.onFileUploadChange
            },
            excelData: {},
            enableUploadExcelButton: false,
            fileList: []
        }
    }

    /*
    * onFileUploadChange - The below function is used when a new excel file is uploaded, the data from the file is converted into json data
    * @{param} - {Object} - info - json object data related to the uploaded file
    */
    onFileUploadChange = (info) => {
        //console.log(info);
        info.fileList.length > 0 ? this.setState({ enableUploadExcelButton: true }) : this.setState({ enableUploadExcelButton: false });
        var excelDataObject = {};
        // In below fileRead, the sheetName are captured and iterated over the sheetName which is used as key for the object
        readXlsxFile(info.file.originFileObj, { getSheets: true }).then((sheets) => {
            sheets.map((sheet) => {
                var excelData = {};
                // In below fileRead, the rows are retrieved from the given sheetName,
                //and this rows are merged to obtain the key value pairs
                readXlsxFile(info.file.originFileObj, { sheet: sheet.name }).then((row) => {
                    const column = row[0];
                    for (var i = 1; i < row.length; i++) {
                        // reduce function is used to merge 2 row data and convert it in to a object of key value pair
                        var result = row[i].reduce((result, field, index) => {
                            result[column[index]] = field;
                            return result;
                        }, {});
                        excelData[result.ProductCode] = result;
                    }
                    excelDataObject[sheet.name] = excelData;
                })
            })
        });
        var excelComponentObject = {};
        excelComponentObject[info.file.name] = excelDataObject;
        this.setState({ excelData: {...this.state.excelData,  ...excelComponentObject}, fileList: info.fileList });
    }

    /* 
    * uploadExcelData - the handler is used to arrange the excel data in a componenet object format 
    *
    */  
    uploadExcelData = () => {
        var componentsToAdd = [];
        console.log(this.state.excelData);
        Object.keys(this.state.excelData).map((excelID, index)=>{
            var tempComponentObjectsArray = [];
            tempComponentObjectsArray = componentDetailsFormat(this.state.excelData[excelID], 'Naveen');
            componentsToAdd = [...componentsToAdd, ...tempComponentObjectsArray];
        })
        this.setState({ enableUploadExcelButton: false, excelData: {}, fileList: [] });
        message.success("Upload Successful");
        console.log("Excel Data converted to component Data Object - ", componentsToAdd);
        //componentDetailsFormat(this.state.excelData, 'Naveen');
    }

    getUploadExcelModal = () => (
        <div style={{ flex: 1, marginRight: '2%' }}>

            {/* A pop-up modal used to upload the excel file, either by dragAndDrop the file
           or choose the file that need to be uploaded */}
            <Modal
                visible={this.state.uploadModelVisible}
                title="Upload Excel"
                onCancel={() => this.setState({ uploadModelVisible: false })}
                footer={
                    <Button type="primary" disabled={!this.state.enableUploadExcelButton}
                        onClick={this.uploadExcelData}
                    >
                        Upload</Button>
                }
            >
                <div style={{ padding: "20px" }}>
                    <Dragger {...this.state.uploadExcelField} fileList={this.state.fileList}>
                        <InboxOutlined />
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Support for a multiple File upload.
                </p>
                    </Dragger>
                </div>
            </Modal>
        </div>
    )

    render() {
        return (
            <div>
                {this.getUploadExcelModal()}
                <Button type="primary"
                    onClick={() => this.setState({ uploadModelVisible: true })}>
                    Upload Excel
                </Button>
            </div>
        )
    }
}