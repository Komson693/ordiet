const API_URL = 'https://ordiet1.onrender.com';

// DOM Elements
const menuListDiv = document.getElementById('menu-list');
const menuForm = document.getElementById('menu-form');
const menuIdInput = document.getElementById('menu-id');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

// --- Functions ---

// Fetch and display all menu items
async function fetchMenu() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        const { data } = await response.json();
        
        menuListDiv.innerHTML = '';
        if (data.length === 0) {
            menuListDiv.innerHTML = '<p>ยังไม่มีรายการอาหารในเมนู</p>';
            return;
        }

        data.forEach(item => {
            const el = document.createElement('div');
            el.className = 'menu-item';
            el.innerHTML = `
                <div class="menu-item-details">
                    <h4>${item.name} - ${item.price} บาท</h4>
                    <p>${item.description || 'ไม่มีคำอธิบาย'}</p>
                </div>
                <div class="menu-item-actions">
                    <button class="edit-btn" data-id="${item.id}">แก้ไข</button>
                    <button class="delete-btn" data-id="${item.id}">ลบ</button>
                </div>
            `;
            menuListDiv.appendChild(el);
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
    }
}

// Reset form to "Add" mode
function resetForm() {
    menuForm.reset();
    menuIdInput.value = '';
    formTitle.textContent = 'เพิ่มรายการอาหารใหม่';
    submitBtn.textContent = 'เพิ่มเมนู';
    cancelBtn.classList.add('hidden');
}

// Populate form for editing
function populateForm(id) {
    fetch(`${API_URL}/menu`)
      .then(res => res.json())
      .then(({data}) => {
          const item = data.find(d => d.id == id);
          if (item) {
              menuIdInput.value = item.id;
              document.getElementById('name').value = item.name;
              document.getElementById('price').value = item.price;
              document.getElementById('description').value = item.description;
              document.getElementById('imageUrl').value = item.imageUrl;

              formTitle.textContent = 'แก้ไขรายการอาหาร';
              submitBtn.textContent = 'บันทึกการแก้ไข';
              cancelBtn.classList.remove('hidden');
              window.scrollTo(0, 0);
          }
      });
}


// --- Event Listeners ---

// Form submission (for both creating and updating)
menuForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = menuIdInput.value;
    const isEditing = !!id;

    const menuItemData = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        description: document.getElementById('description').value,
        imageUrl: document.getElementById('imageUrl').value,
    };

    const url = isEditing ? `${API_URL}/menu/${id}` : `${API_URL}/menu`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(menuItemData),
        });
        
        if (!response.ok) throw new Error('Something went wrong');
        
        resetForm();
        fetchMenu();
    } catch (error) {
        console.error('Error saving menu item:', error);
    }
});

// Cancel edit button
cancelBtn.addEventListener('click', resetForm);

// Edit and Delete buttons (using event delegation)
menuListDiv.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
            try {
                await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
                fetchMenu();
            } catch (error) {
                console.error('Error deleting menu item:', error);
            }
        }
    }

    if (e.target.classList.contains('edit-btn')) {
        populateForm(id);
    }
});

// Initial load
fetchMenu();