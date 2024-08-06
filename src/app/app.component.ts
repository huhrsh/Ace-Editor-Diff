import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileListComponent } from './file-list/file-list.component';
import { DiffViewerComponent } from './diff-viewer/diff-viewer.component';
import { ApprovalComponent } from "./approval/approval.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FileListComponent, DiffViewerComponent, ApprovalComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  selectedFile: string='';

  unselectFile(){
    this.selectedFile=""
  }

  onFileSelected(file: string) {
    this.selectedFile = file;
  }
  title = 'ace-diff-viewer';
}
