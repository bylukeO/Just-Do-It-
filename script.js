document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS (Animate on Scroll)
  AOS.init({
    once: false, // whether animation should happen only once - while scrolling down
    mirror: true, // whether elements should animate out while scrolling past them
  });
  
  const taskInput = document.getElementById('task-input');
  const addTaskBtn = document.getElementById('add-task');
  const taskList = document.getElementById('task-list');
  const emptyImage = document.querySelector('.empty-image');
  const todosContainer = document.querySelector('.todos-container');
  const progress = document.getElementById('progress');
  const numbers = document.getElementById('numbers');
  const motivationalWord = document.getElementById('motivational-word');
  const wordMeaning = document.getElementById('word-meaning');
  
  // Flag to prevent confetti on initial load
  let isInitialLoad = true;
  
  // Stats tracking
  let totalTasks = 0;
  let completedTasks = 0;
  
  // Motivational words array with meanings
  const motivationalWords = [
    { word: "FOCUS", meaning: "Follow One Course Until Success" },
    { word: "PUSH", meaning: "Persist Until Something Happens" },
    { word: "NOW", meaning: "No Opportunity Wasted" },
    { word: "DREAM", meaning: "Dedication, Resilience, Effort, Ambition, Motivation" },
    { word: "ACTION", meaning: "All Changes Take Initiative Only Now" },
    { word: "THINK", meaning: "True Habits Inspire Notable Knowledge" },
    { word: "GROW", meaning: "Generate Results and Overcome Weakness" },
    { word: "START", meaning: "Steps Taken Always Reach Targets" },
    { word: "TEAM", meaning: "Together Everyone Achieves More" },
    { word: "CREATE", meaning: "Courage to Realize Excellence And Transform Everything" }
  ];
  
  // Set random motivational word
  const setRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * motivationalWords.length);
    const wordObj = motivationalWords[randomIndex];
    motivationalWord.textContent = wordObj.word;
    wordMeaning.textContent = wordObj.meaning;
    
    // Apply a new animation each time
    const wordElement = document.querySelector('.word-of-day');
    wordElement.classList.remove('aos-animate');
    setTimeout(() => {
      wordElement.classList.add('aos-animate');
    }, 100);
  };
  
  // Set initial word
  setRandomWord();
  
  // Change word every 24 hours or on new day
  const lastWordDate = localStorage.getItem('lastWordDate');
  const today = new Date().toDateString();
  
  if (lastWordDate !== today) {
    localStorage.setItem('lastWordDate', today);
    // We already set a random word above
  }
  
  // Add scroll event to change word
  let lastScrollTop = 0;
  let scrollThreshold = 300; // Amount of scroll before changing word
  let scrollTimeout;
  
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Check if scrolled enough in either direction
      if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
        setRandomWord();
        lastScrollTop = scrollTop;
      }
    }, 100);
  });
  
  const updateStats = () => {
    totalTasks = taskList.children.length;
    completedTasks = document.querySelectorAll('#task-list li.completed').length;
    
    // Update the progress bar
    const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    progress.style.width = `${progressPercentage}%`;
    
    // Update the numbers display
    numbers.textContent = `${completedTasks} / ${totalTasks}`;
    
    // Trigger confetti when all tasks are completed, but not on initial load
    if (!isInitialLoad && totalTasks > 0 && completedTasks === totalTasks) {
      Confetti();
    }
  };
  
  const saveTasksToLocalStorage = () => {
    const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
      text: li.querySelector('span').textContent,
      completed: li.querySelector('.checkbox').checked
    }));
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };
  
  const loadTasksFromLocalStorage = () => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Clear existing tasks
    taskList.innerHTML = '';
    
    // Add saved tasks
    tasks.forEach(task => {
      addTask(task.text, task.completed);
    });
    
    // Set flag to false after all tasks are loaded
    setTimeout(() => {
      isInitialLoad = false;
    }, 500);
  };
  
  const toggleEmptyState = () => {
    emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
    todosContainer.style.width = taskList.children.length > 0 ? '100%' : '50%';
    updateStats();
    // Save to local storage whenever the task list changes
    saveTasksToLocalStorage();
  };
  
  const addTask = (text, completed = false) => {
    const taskText = text || taskInput.value.trim();
    if (!taskText) {
      return;
    }

    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''}>
      <span>${taskText}</span>
      <div class="task-buttons">
        <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    
    const checkbox = li.querySelector('.checkbox');
    const editBtn = li.querySelector('.edit-btn');
    
    // Set initial state if task is completed
    if (completed) {
      li.classList.add('completed');
      editBtn.disabled = true;
      editBtn.style.opacity = '0.5';
      editBtn.style.pointerEvents = 'none';
    }
    
    checkbox.addEventListener('change', () => {
      const isChecked = checkbox.checked;
      li.classList.toggle('completed', isChecked);
      editBtn.disabled = isChecked;
      editBtn.style.opacity = isChecked ? '0.5' : '1';
      editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
      updateStats();
      saveTasksToLocalStorage(); // Save when task status changes
    });
    
    editBtn.addEventListener('click', () => {
      if(!checkbox.checked) {
        taskInput.value = li.querySelector('span').textContent;
        li.remove();
        toggleEmptyState();
      }
    });
    
    li.querySelector('.delete-btn').addEventListener('click', () => {
      li.remove();
      toggleEmptyState();
    });
    
    // Add the new task with a fade-in animation
    li.style.opacity = '0';
    taskList.appendChild(li);
    setTimeout(() => {
      li.style.opacity = '1';
      li.style.transition = 'opacity 0.3s ease';
    }, 10);
    
    taskInput.value = '';
    toggleEmptyState();
  };
  
  addTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();
    addTask();
  });
  
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });
  
  // Load tasks from local storage when the page loads
  loadTasksFromLocalStorage();
  
  // Initialize the empty state after loading tasks
  toggleEmptyState();
});

const Confetti = () => {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["star"],
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
  };
  
  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ["star"],
    });
  
    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ["circle"],
    });
  }
  
  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};
