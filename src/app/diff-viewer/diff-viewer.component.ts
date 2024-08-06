import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import * as Diff from 'diff';
import stringify from 'json-stable-stringify';

@Component({
  selector: 'app-diff-viewer',
  standalone: true,
  templateUrl: './diff-viewer.component.html',
  styleUrls: ['./diff-viewer.component.css']
})
export class DiffViewerComponent implements OnInit, OnChanges {
  @Input() fileName: string = '';
  @Output() fileUnselected = new EventEmitter<void>();
  @ViewChild('originalContentContainer') originalContentContainer!: ElementRef<HTMLPreElement>;
  @ViewChild('modifiedContentContainer') modifiedContentContainer!: ElementRef<HTMLPreElement>;
  fileList: { [key: string]: any } = {};
  originalContent: string = '';
  modifiedContent: string = '';
  requestInProgress: boolean = false;

  unselectFile() {
    this.fileUnselected.emit();
  }

  ngOnInit() {
    this.loadFileListFromLocalStorage();
    if (this.fileName) {
      this.loadFileContent();
    }
  }

  ngOnChanges() {
    if (this.fileName) {
      this.loadFileContent();
    }
  }

  private async loadFileContent() {
    if (this.fileList && this.fileName) {
      let fileEntry = this.fileList[this.fileName];

      const timeout = 5000;
      const interval = 100;
      const maxChecks = timeout / interval;
      let checks = 0;

      while (!fileEntry && checks < maxChecks) {
        await new Promise(resolve => setTimeout(resolve, interval));
        fileEntry = this.fileList[this.fileName];
        checks++;
      }

      if (fileEntry) {
        this.originalContent = stringify(fileEntry.originalData, { space: 2 }) || '';
        this.modifiedContent = stringify(fileEntry.modifiedData, { space: 2 }) || '';
        if (this.originalContentContainer) {
          this.originalContentContainer.nativeElement.textContent = this.originalContent;
        }
        if (this.modifiedContentContainer) {
          this.modifiedContentContainer.nativeElement.textContent = this.modifiedContent;
        }
        this.diffJSON(fileEntry.originalData, fileEntry.modifiedData);
      } else {
        console.error('File entry not found or loading timed out for:', this.fileName);
      }
    } else {
      console.error('File list or file name not available.');
    }
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

  private diffJSON(original: any, modified: any) {
    const diff = Diff.diffJson(original, modified);
    const diffHtml = diff.map(part => {
      const color = part.added ? 'background-color: #d4fcbc;' :
                    part.removed ? 'background-color: #fbcfcf;' :
                    'background-color: transparent;';
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      const value = typeof part.value === 'object' ? stringify(part.value, { space: 2 }) : part.value;
      return `<span style="${color}">${prefix}${value}</span>`;
    }).join('');

    if (this.originalContentContainer) {
      this.originalContentContainer.nativeElement.innerHTML = diffHtml;
    }
  }

  saveChanges() {
    if (this.requestInProgress) return;
    this.requestInProgress = true;

    const updatedContent = this.modifiedContentContainer?.nativeElement.textContent || ''; // Provide default value
    if (this.fileName && this.fileList[this.fileName]) {
      this.fileList[this.fileName] = {
        ...this.fileList[this.fileName],
        modifiedData: JSON.parse(updatedContent),
        approved: false 
      };

      const fileListArray = Object.keys(this.fileList).map(key => ({
        name: key,
        ...this.fileList[key]
      }));

      localStorage.setItem('fileList', JSON.stringify(fileListArray));
      console.log('Saving changes:', this.fileList[this.fileName]);
      setTimeout(() => {
        this.requestInProgress = false;
      }, 2000);
    }
  }
}
