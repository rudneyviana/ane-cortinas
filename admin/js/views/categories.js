import { get, post, put, del } from '../api_service.js';
import { showToast, showModal, closeModal, renderSpinner } from '../ui_service.js';
import { navigate } from '../router.js';

let categories = [];
const contentContainerId = 'categories-content';

export function init(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Categories</h1>
            <button id="add-category-btn" class="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 flex items-center">
                <i data-lucide="plus" class="w-5 h-5 mr-2"></i> Add Category
            </button>
        </div>
        <div id="${contentContainerId}" class="bg-white p-6 rounded-lg shadow-md">
            <!-- Categories table will be rendered here -->
        </div>
    `;
    lucide.createIcons();

    document.getElementById('add-category-btn').addEventListener('click', () => showCategoryForm());
    
    fetchAndRenderCategories();
}

async function fetchAndRenderCategories() {
    const contentContainer = document.getElementById(contentContainerId);
    renderSpinner(contentContainer);
    
    try {
        categories = await get('categories/index.php');
        renderCategoriesTable(contentContainer);
    } catch (error) {
        showToast(error.message, 'error');
        contentContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    }
}

function renderCategoriesTable(container) {
    if (categories.length === 0) {
        container.innerHTML = `<p>No categories found. Click 'Add Category' to create one.</p>`;
        return;
    }

    const tableRows = categories.map(category => `
        <tr class="border-b hover:bg-gray-50">
            <td class="p-4">${category.id}</td>
            <td class="p-4 font-medium text-gray-800">${category.name}</td>
            <td class="p-4 text-right">
                <button class="edit-btn p-2 text-gray-500 hover:text-sky-600" data-id="${category.id}"><i data-lucide="edit" class="w-5 h-5"></i></button>
                <button class="delete-btn p-2 text-gray-500 hover:text-red-600" data-id="${category.id}"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `
        <table class="w-full text-left">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-4 font-semibold">ID</th>
                    <th class="p-4 font-semibold">Name</th>
                    <th class="p-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
    lucide.createIcons();

    container.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => handleEdit(e.currentTarget.dataset.id)));
    container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.id)));
}

function showCategoryForm(category = null) {
    const isEditing = category !== null;
    const title = isEditing ? 'Edit Category' : 'Add New Category';
    const content = `
        <form id="category-form">
            <input type="hidden" id="category-id" value="${isEditing ? category.id : ''}">
            <div>
                <label for="category-name" class="block text-sm font-medium text-gray-700">Category Name</label>
                <input type="text" id="category-name" name="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" value="${isEditing ? category.name : ''}" required>
            </div>
        </form>
    `;
    const footer = `
        <button id="modal-cancel-btn" type="button" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button id="modal-save-btn" type="submit" form="category-form" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700">Save</button>
    `;

    showModal(title, content, footer);

    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('category-form').addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const isEditing = id !== '';

    try {
        if (isEditing) {
            await put(`categories/single.php?id=${id}`, { name });
            showToast('Category updated successfully!', 'success');
        } else {
            await post('categories/index.php', { name });
            showToast('Category created successfully!', 'success');
        }
        closeModal();
        fetchAndRenderCategories();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function handleEdit(id) {
    const category = categories.find(c => c.id == id);
    if (category) {
        showCategoryForm(category);
    }
}

function handleDelete(id) {
    const category = categories.find(c => c.id == id);
    if (!category) return;

    const title = 'Delete Category';
    const content = `<p>Are you sure you want to delete the category "<strong>${category.name}</strong>"? This action cannot be undone.</p>`;
    const footer = `
        <button id="modal-cancel-btn" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button id="confirm-delete-btn" class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">Delete</button>
    `;

    showModal(title, content, footer);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        try {
            await del(`categories/single.php?id=${id}`);
            showToast('Category deleted successfully!', 'success');
            closeModal();
            fetchAndRenderCategories();
        } catch (error) {
            showToast(error.message, 'error');
            closeModal();
        }
    });
}
