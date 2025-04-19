document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS (Animate on Scroll)
  AOS.init({
    once: false, 
    mirror: true,
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
  const todoApp = document.querySelector('.todo-app');
  const statusMessage = document.getElementById('status-message');
  
  // prevent confetti on initial load
  let isInitialLoad = true;
  
  // Track the last action type to prevent confetti on delete
  let lastAction = null; // 'complete', 'delete', 'add', 'edit'
  
  // Theme toggle functionality
  const initThemeToggle = () => {
    // Create theme toggle button
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.className = 'theme-toggle';
    themeToggleBtn.setAttribute('aria-label', 'Toggle dark/light mode');
    themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Default icon (dark mode icon)
    
    // Insert the button into the DOM
    todoApp.appendChild(themeToggleBtn);
    
    // Check for saved theme preference or use default
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the saved theme on page load
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update button icon based on current theme
    updateThemeIcon(currentTheme);
    
    // Toggle theme when button is clicked
    themeToggleBtn.addEventListener('click', () => {
      // Get current theme
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      
      // Toggle to other theme
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Update data-theme attribute
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Save preference to local storage
      localStorage.setItem('theme', newTheme);
      
      // Update button icon
      updateThemeIcon(newTheme);
    });
    
    // Function to update the theme icon
    function updateThemeIcon(theme) {
      if (theme === 'dark') {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'; // Light mode icon
      } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Dark mode icon
      }
    }
  };
  
  // Initialize theme toggle
  initThemeToggle();
  
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
  
  // Initialize Typed.js for Motivational Word
  let currentWordIndex = Math.floor(Math.random() * motivationalWords.length);
  let wordTyped = null;
  
  // Function to initialize and display the word of the day
  const displayMotivationalWord = () => {
    // Clear previous content and typed instances
    motivationalWord.innerHTML = '';
    wordMeaning.innerHTML = '';
    
    if (wordTyped) {
      wordTyped.destroy();
    }
    
    // Initialize with new word - no cursor
    wordTyped = new Typed('#motivational-word', {
      strings: [motivationalWords[currentWordIndex].word],
      typeSpeed: 60,
      startDelay: 300,
      showCursor: false, // No cursor to prevent layout issues
      onComplete: (self) => {
        // Once the word is typed, show the meaning
        new Typed('#word-meaning', {
          strings: [motivationalWords[currentWordIndex].meaning],
          typeSpeed: 30,
          startDelay: 200,
          showCursor: false
        });
      }
    });
  };
  
  // Initial display of motivational word
  displayMotivationalWord();
  
  // Change to a new random motivational word
  const setRandomWord = () => {
    // Get a new random word (different from the current one)
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * motivationalWords.length);
    } while (newIndex === currentWordIndex && motivationalWords.length > 1);
    
    currentWordIndex = newIndex;
    
    // Display the new word with typing animation
    displayMotivationalWord();
  };
  
  // Change word every 24 hours or on new day
  const lastWordDate = localStorage.getItem('lastWordDate');
  const today = new Date().toDateString();
  
  if (lastWordDate !== today) {
    localStorage.setItem('lastWordDate', today);
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
    
    // Update status message based on task completion
    if (totalTasks > 0 && completedTasks === totalTasks) {
      // Change message to "Way to go fam" when all tasks are completed
      statusMessage.textContent = "Way to go fam!";
      statusMessage.classList.add('completed-message');
      
      // Trigger confetti when all tasks are completed, but not on initial load
      // AND not when tasks are deleted
      if (!isInitialLoad && lastAction === 'complete') {
        Confetti();
      }
    } else {
      // Reset message to "Keep It Up" when not all tasks are completed
      statusMessage.textContent = "Keep It Up";
      statusMessage.classList.remove('completed-message');
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
    lastAction = 'add';
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
      lastAction = 'complete';
      const isChecked = checkbox.checked;
      li.classList.toggle('completed', isChecked);
      editBtn.disabled = isChecked;
      editBtn.style.opacity = isChecked ? '0.5' : '1';
      editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
      updateStats();
      saveTasksToLocalStorage(); // Save when task status changes
    });
    
    editBtn.addEventListener('click', () => {
      lastAction = 'edit';
      if(!checkbox.checked) {
        taskInput.value = li.querySelector('span').textContent;
        li.remove();
        toggleEmptyState();
      }
    });
    
    li.querySelector('.delete-btn').addEventListener('click', () => {
      lastAction = 'delete';
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
