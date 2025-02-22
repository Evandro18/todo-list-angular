import { Component } from '@angular/core';
import { TodoTasksComponent } from './todo-tasks/todo-tasks.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})
export class AppComponent {
  title = 'angular-todo-list';
  todoTasks = TodoTasksComponent;
}
