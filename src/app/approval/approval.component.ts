import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-approval',
  imports:[CommonModule],
  standalone: true,
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.css'],
})
export class ApprovalComponent implements OnInit{
  @Input() fileList: { [key: string]: any } = {};
  @Output() fileNameSelected = new EventEmitter<string>();

  
  ngOnInit() {
    this.loadFileListFromLocalStorage();
  }

  private loadFileListFromLocalStorage() {
    const storedFileList = localStorage.getItem('fileList');
    if (storedFileList) {
      try {
        const parsedList = JSON.parse(storedFileList);
        this.fileList = parsedList.reduce((acc: any, item: any) => {
          acc[item.name] = {
            originalData: item.originalData,
            modifiedData: item.modifiedData,
            approved: item.approved || false // Include the approved flag
          };
          return acc;
        }, {});
      } catch (error) {
        console.error('Failed to parse fileList from localStorage:', error);
        this.fileList = {};
      }
    }
  }

  get unapprovedFiles() {
    return Object.keys(this.fileList)
      .filter(key => !this.fileList[key].approved)
      .map(key => ({ key, ...this.fileList[key] }));
  }

  selectFile(fileName: string) {
    this.fileNameSelected.emit(fileName);
  }

  approveFile(fileName: string) {
    const file = this.fileList[fileName];
    if (file) {
      file.originalData = { ...file.modifiedData };
      file.approved = true;
      this.saveFileListToLocalStorage();
    }
  }

  disapproveFile(fileName: string) {
    const file = this.fileList[fileName];
    if (file) {
      file.modifiedData = { ...file.originalData };
      file.approved = true;
      this.saveFileListToLocalStorage();
    }
  }

  

  private saveFileListToLocalStorage() {
    const fileListArray = Object.keys(this.fileList).map(key => ({
      name: key,
      ...this.fileList[key]
    }));
    localStorage.setItem('fileList', JSON.stringify(fileListArray));
  }
}
