/**
 * Student Task Manager - Frontend Application Script
 * Vanilla JavaScript communicating with REST API via fetch()
 * Note: Tasks are never stored in localStorage (directly fetched from API)
 */

(function () {
  'use strict';

  // State
  let authToken = sessionStorage.getItem('token') || '';
  let currentUser = null;
  try {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) currentUser = JSON.parse(savedUser);
  } catch (e) {
    currentUser = null;
  }

  // DOM Elements
  const headerUserPanel = document.getElementById('header-user-panel');
  const userStatusLabel = document.getElementById('user-status-label');
  const btnLogout = document.getElementById('btn-logout');

  const notificationContainer = document.getElementById('notification-container');
  const notificationBox = document.getElementById('notification-box');
  const notificationText = document.getElementById('notification-text');
  const notificationClose = document.getElementById('notification-close');

  const authSection = document.getElementById('auth-section');
  const loginForm = document.getElementById('login-form');
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');
  const btnLoginSubmit = document.getElementById('btn-login-submit');

  const dashboardSection = document.getElementById('dashboard-section');
  const statTotal = document.getElementById('stat-total');
  const statTodo = document.getElementById('stat-todo');
  const statInprogress = document.getElementById('stat-inprogress');
  const statCompleted = document.getElementById('stat-completed');
  const filterStatus = document.getElementById('filter-status');
  const btnRefreshTasks = document.getElementById('btn-refresh-tasks');

  const addTaskForm = document.getElementById('add-task-form');
  const taskTitleInput = document.getElementById('task-title');
  const taskDescInput = document.getElementById('task-description');
  const taskCourseInput = document.getElementById('task-course');
  const taskDueDateInput = document.getElementById('task-due-date');
  const taskPriorityInput = document.getElementById('task-priority');
  const taskStatusInput = document.getElementById('task-status');
  const btnAddTaskSubmit = document.getElementById('btn-add-task-submit');

  const tasksLoading = document.getElementById('tasks-loading');
  const tasksEmpty = document.getElementById('tasks-empty');
  const tasksList = document.getElementById('tasks-list');

  // Set default due date to 7 days from today
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 7);
  if (taskDueDateInput) {
    taskDueDateInput.value = defaultDueDate.toISOString().split('T')[0];
  }

  // Notification helper
  let notificationTimer = null;
  function showNotification(message, type = 'info') {
    if (!notificationContainer) return;

    notificationBox.className = 'notification-box ' + type;
    notificationText.textContent = message;
    notificationContainer.style.display = 'block';

    if (notificationTimer) clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => {
      notificationContainer.style.display = 'none';
    }, 4000);
  }

  if (notificationClose) {
    notificationClose.addEventListener('click', () => {
      notificationContainer.style.display = 'none';
    });
  }

  // Update UI Auth State
  function updateAuthState() {
    if (authToken && currentUser) {
      authSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      userStatusLabel.textContent = `Nguoi dung: ${currentUser.fullName || currentUser.username} (${currentUser.role || 'sinh vien'})`;
      btnLogout.style.display = 'inline-flex';
      fetchTasks();
    } else {
      authSection.style.display = 'block';
      dashboardSection.style.display = 'none';
      userStatusLabel.textContent = 'Trang thai: Chua dang nhap';
      btnLogout.style.display = 'none';
      tasksList.innerHTML = '';
    }
  }

  // LOGIN Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = loginUsername.value.trim();
      const password = loginPassword.value;

      if (!username || !password) {
        showNotification('Vui long nhap day du ten dang nhap va mat khau.', 'error');
        return;
      }

      btnLoginSubmit.disabled = true;
      btnLoginSubmit.textContent = 'Dang xu ly...';

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          authToken = data.data.token;
          currentUser = data.data.user;

          sessionStorage.setItem('token', authToken);
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

          showNotification('Dang nhap thanh cong!', 'success');
          updateAuthState();
        } else {
          showNotification(data.message || 'Dang nhap that bai.', 'error');
        }
      } catch (err) {
        showNotification('Khong the ket noi den REST API: ' + err.message, 'error');
      } finally {
        btnLoginSubmit.disabled = false;
        btnLoginSubmit.textContent = 'Dang nhap';
      }
    });
  }

  // LOGOUT Handler
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      authToken = '';
      currentUser = null;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('currentUser');
      showNotification('Da dang xuat khoi he thong.', 'info');
      updateAuthState();
    });
  }

  // FETCH TASKS Handler (Connecting directly to GET /api/tasks)
  async function fetchTasks() {
    if (!authToken) return;

    tasksLoading.style.display = 'block';
    tasksEmpty.style.display = 'none';
    tasksList.innerHTML = '';

    try {
      const selectedStatus = filterStatus ? filterStatus.value : '';
      let url = '/api/tasks';
      if (selectedStatus) {
        url += `?status=${encodeURIComponent(selectedStatus)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.status === 401) {
        showNotification('Phien dang nhap het han hoac token khong hop le. Vui long dang nhap lai.', 'error');
        authToken = '';
        currentUser = null;
        sessionStorage.clear();
        updateAuthState();
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        const tasks = result.data || [];
        updateStatistics(tasks);
        renderTaskList(tasks);
      } else {
        showNotification(result.message || 'Loi khi tai danh sach nhiem vu.', 'error');
      }
    } catch (err) {
      showNotification('Loi ket noi API: ' + err.message, 'error');
    } finally {
      tasksLoading.style.display = 'none';
    }
  }

  // Update Summary Statistics
  function updateStatistics(tasks) {
    let todoCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    tasks.forEach(task => {
      const st = (task.status || '').toUpperCase();
      if (st === 'TODO') todoCount++;
      else if (st === 'IN_PROGRESS') inProgressCount++;
      else if (st === 'COMPLETED') completedCount++;
    });

    if (statTotal) statTotal.textContent = tasks.length;
    if (statTodo) statTodo.textContent = todoCount;
    if (statInprogress) statInprogress.textContent = inProgressCount;
    if (statCompleted) statCompleted.textContent = completedCount;
  }

  // Render Task List
  function renderTaskList(tasks) {
    tasksList.innerHTML = '';

    if (!tasks || tasks.length === 0) {
      tasksEmpty.style.display = 'block';
      return;
    }

    tasksEmpty.style.display = 'none';

    tasks.forEach(task => {
      const card = document.createElement('div');
      const statusClass = (task.status || 'TODO').toLowerCase();
      card.className = `task-card status-${statusClass}`;

      // Priority Tag Class & Text
      const priority = (task.priority || 'MEDIUM').toUpperCase();
      let priorityClass = 'tag-priority-medium';
      let priorityLabel = 'Trung binh';
      if (priority === 'HIGH') {
        priorityClass = 'tag-priority-high';
        priorityLabel = 'Cao';
      } else if (priority === 'LOW') {
        priorityClass = 'tag-priority-low';
        priorityLabel = 'Thap';
      }

      // Status Label
      const status = (task.status || 'TODO').toUpperCase();
      let statusLabel = 'Can lam';
      if (status === 'IN_PROGRESS') statusLabel = 'Dang lam';
      else if (status === 'COMPLETED') statusLabel = 'Da hoan thanh';

      // Header row
      const headerDiv = document.createElement('div');
      headerDiv.className = 'task-header';

      const titleEl = document.createElement('h3');
      titleEl.className = 'task-title';
      titleEl.textContent = task.title;

      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'task-tags';

      if (task.course) {
        const courseTag = document.createElement('span');
        courseTag.className = 'tag tag-course';
        courseTag.textContent = task.course;
        tagsDiv.appendChild(courseTag);
      }

      const priorityTag = document.createElement('span');
      priorityTag.className = `tag ${priorityClass}`;
      priorityTag.textContent = `Uu tien: ${priorityLabel}`;
      tagsDiv.appendChild(priorityTag);

      headerDiv.appendChild(titleEl);
      headerDiv.appendChild(tagsDiv);
      card.appendChild(headerDiv);

      // Description
      if (task.description) {
        const descEl = document.createElement('p');
        descEl.className = 'task-description';
        descEl.textContent = task.description;
        card.appendChild(descEl);
      }

      // Meta info and Actions
      const metaDiv = document.createElement('div');
      metaDiv.className = 'task-meta';

      const infoGroup = document.createElement('div');
      infoGroup.className = 'task-info-group';

      const dueSpan = document.createElement('span');
      dueSpan.textContent = `Han nop: ${task.dueDate || 'Khong co'}`;
      infoGroup.appendChild(dueSpan);

      const statusSpan = document.createElement('span');
      statusSpan.textContent = `Trang thai: ${statusLabel}`;
      infoGroup.appendChild(statusSpan);

      metaDiv.appendChild(infoGroup);

      // Actions container
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'task-actions';

      // Complete / Incomplete Toggle Button
      if (status !== 'COMPLETED') {
        const btnComplete = document.createElement('button');
        btnComplete.type = 'button';
        btnComplete.className = 'btn btn-success btn-sm';
        btnComplete.textContent = 'Hoan thanh';
        btnComplete.addEventListener('click', () => updateTaskStatus(task.id, 'COMPLETED'));
        actionsDiv.appendChild(btnComplete);
      } else {
        const btnReopen = document.createElement('button');
        btnReopen.type = 'button';
        btnReopen.className = 'btn btn-secondary btn-sm';
        btnReopen.textContent = 'Lam lai';
        btnReopen.addEventListener('click', () => updateTaskStatus(task.id, 'TODO'));
        actionsDiv.appendChild(btnReopen);
      }

      // Delete Button
      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn btn-danger btn-sm';
      btnDelete.textContent = 'Xoa';
      btnDelete.addEventListener('click', () => deleteTask(task.id, task.title));
      actionsDiv.appendChild(btnDelete);

      metaDiv.appendChild(actionsDiv);
      card.appendChild(metaDiv);

      tasksList.appendChild(card);
    });
  }

  // ADD TASK Handler (POST /api/tasks)
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const title = taskTitleInput.value.trim();
      const description = taskDescInput.value.trim();
      const course = taskCourseInput.value.trim() || 'SWT301';
      const dueDate = taskDueDateInput.value;
      const priority = taskPriorityInput.value;
      const status = taskStatusInput.value;

      if (!title) {
        showNotification('Vui long nhap tieu de nhiem vu.', 'error');
        return;
      }

      btnAddTaskSubmit.disabled = true;
      btnAddTaskSubmit.textContent = 'Dang luu...';

      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title,
            description,
            course,
            dueDate,
            priority,
            status
          })
        });

        const data = await response.json();

        if (response.status === 201 && data.success) {
          showNotification(`Da them nhiem vu moi: "${title}"`, 'success');
          addTaskForm.reset();
          // Restore default course and due date
          taskCourseInput.value = 'SWT301';
          taskDueDateInput.value = defaultDueDate.toISOString().split('T')[0];
          fetchTasks();
        } else {
          showNotification(data.message || 'Loi khi them nhiem vu.', 'error');
        }
      } catch (err) {
        showNotification('Loi ket noi khi them nhiem vu: ' + err.message, 'error');
      } finally {
        btnAddTaskSubmit.disabled = false;
        btnAddTaskSubmit.textContent = 'Them nhiem vu';
      }
    });
  }

  // UPDATE TASK STATUS Handler (PUT /api/tasks/:id)
  async function updateTaskStatus(taskId, newStatus) {
    if (!authToken) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const statusText = newStatus === 'COMPLETED' ? 'Hoan thanh' : 'Can lam';
        showNotification(`Da chuyen trang thai nhiem vu sang: ${statusText}`, 'success');
        fetchTasks();
      } else {
        showNotification(data.message || 'Khong the cap nhat trang thai nhiem vu.', 'error');
      }
    } catch (err) {
      showNotification('Loi ket noi khi cap nhat nhiem vu: ' + err.message, 'error');
    }
  }

  // DELETE TASK Handler (DELETE /api/tasks/:id)
  async function deleteTask(taskId, taskTitle) {
    if (!authToken) return;

    const confirmed = confirm(`Xac nhan xoa nhiem vu: "${taskTitle}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification('Da xoa nhiem vu thanh cong.', 'success');
        fetchTasks();
      } else {
        showNotification(data.message || 'Khong the xoa nhiem vu.', 'error');
      }
    } catch (err) {
      showNotification('Loi ket noi khi xoa nhiem vu: ' + err.message, 'error');
    }
  }

  // Controls Event Listeners
  if (filterStatus) {
    filterStatus.addEventListener('change', fetchTasks);
  }

  if (btnRefreshTasks) {
    btnRefreshTasks.addEventListener('click', function () {
      showNotification('Dang dong bo du lieu tu API...', 'info');
      fetchTasks();
    });
  }

  // Initial Boot
  updateAuthState();
})();
