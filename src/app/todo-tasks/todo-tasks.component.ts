import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { Task } from './task.model';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-todo-tasks',
  templateUrl: './todo-tasks.component.html',
  styleUrls: ['./todo-tasks.component.scss']
})
export class TodoTasksComponent implements OnInit {
  private readonly STORAGE_KEY = 'tasks';

  constructor(
    private storageService: LocalStorageService,
    private dialog: MatDialog
  ) {
    this.addTaskSubject.pipe(
      filter((taskValue): taskValue is string =>
        !!taskValue && taskValue.trim().length > 0
      ),
      map(taskValue => ({
        id: this.tasks.length + 1,
        title: taskValue.trim(),
        description: '',
        completed: false
      }))
    ).subscribe(newTask => {
      this.tasks.push(newTask);
      this.tasksSubject.next(this.tasks);
      this.storageService.setItems(this.STORAGE_KEY, this.tasks);
      this.taskFormControl.reset();
    });
  }

  tasks: Task[] = [];
  filteredTasks: Task[] = [];

  taskFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  matcher = new MyErrorStateMatcher();

  filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'incomplete', label: 'Incomplete' }
  ];

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private filterSubject = new BehaviorSubject<string>('all');
  private searchSubject = new BehaviorSubject<string>('');
  private addTaskSubject = new BehaviorSubject<string | null>(null);

  ngOnInit(): void {
    this.tasks = this.storageService.getItems<Task>(this.STORAGE_KEY);
    this.tasksSubject.next(this.tasks);
    this.setupTasksFilter();
  }

  private setupTasksFilter(): void {
    combineLatest([
      this.tasksSubject,
      this.filterSubject,
      this.searchSubject
    ]).pipe(
      map(([tasks, filter, search]) => {
        let filtered = tasks;

        // Apply status filter
        if (filter === 'completed') {
          filtered = filtered.filter(task => task.completed);
        } else if (filter === 'incomplete') {
          filtered = filtered.filter(task => !task.completed);
        }

        // Apply search filter
        if (search) {
          filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(search.toLowerCase())
          );
        }

        return filtered;
      })
    ).subscribe(filteredTasks => {
      this.filteredTasks = filteredTasks;
    });
  }

  onFilterChange(filter: string): void {
    this.filterSubject.next(filter);
  }

  addTask(): void {
    if (this.taskFormControl.valid) {
      this.addTaskSubject.next(this.taskFormControl.value);
      this.taskFormControl.reset();
    } else {
      this.taskFormControl.markAsTouched();
    }
  }

  subscribeToTasksControl(): void {
    this.taskFormControl.valueChanges.subscribe(value => {
      this.searchSubject.next(value || '');
    });
  }

  deleteTask(taskId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.tasksSubject.next(this.tasks);
        this.storageService.setItems(this.STORAGE_KEY, this.tasks);
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    task.completed = !task.completed;
    this.tasksSubject.next([...this.tasks]);
    this.storageService.setItems(this.STORAGE_KEY, this.tasks);
  }
}
