<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";

interface Post {
  title: string;
  id: string;
  body: string;
}

const loading = ref(false);
const err = ref("");

// Используем Set для хранения ID постов, которые в режиме редактирования
const editingPosts = ref<Set<string>>(new Set());

// Форма для создания нового поста
const formData = ref({ title: "", body: "" });

// Форма для редактирования существующего поста
const editFormData = ref<Record<string, { title: string; body: string }>>({});

const posts = ref([] as Post[]);

const getPost = async () => {
  loading.value = true;
  err.value = "";
  try {
    const response = await axios.get("/posts");
    posts.value = response.data;
    
    // Инициализируем данные для редактирования
    posts.value.forEach(post => {
      if (!editFormData.value[post.id]) {
        editFormData.value[post.id] = {
          title: post.title,
          body: post.body
        };
      }
    });
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      err.value = error.message;
    } else {
      err.value = "Unknown error";
    }
  } finally {
    loading.value = false;
  }
};

const sendPost = async () => {
  if (!formData.value.title.trim() || !formData.value.body.trim()) {
    err.value = "Please fill both title and body";
    return;
  }
  
  loading.value = true;
  err.value = "";
  try {
    const response = await axios.post("/posts", {
      title: formData.value.title,
      body: formData.value.body,
    });
    
    // Добавляем новый пост в список
    posts.value.push(response.data);
    
    // Инициализируем данные для редактирования
    editFormData.value[response.data.id] = {
      title: response.data.title,
      body: response.data.body
    };
    
    console.log("Post created successfully");
    
    // Очищаем форму
    formData.value.title = "";
    formData.value.body = "";
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      err.value = error.message;
    } else {
      err.value = "Unknown error";
    }
  } finally {
    loading.value = false;
  }
};

const deletePost = async (id: string) => {
  if (!confirm("Are you sure you want to delete this post?")) {
    return;
  }
  
  err.value = "";
  try {
    await axios.delete(`/posts/${id}`);
    
    // Удаляем пост из списка
    posts.value = posts.value.filter(post => post.id !== id);
    
    // Удаляем из режима редактирования если был там
    editingPosts.value.delete(id);
    
    // Удаляем данные формы
    delete editFormData.value[id];
    
    console.log("Post deleted successfully");
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      err.value = error.message;
    } else {
      err.value = "Unknown error";
    }
  }
};

const openChangePost = (id: string) => {
  // Переключаем режим редактирования для конкретного поста
  if (editingPosts.value.has(id)) {
    editingPosts.value.delete(id);
  } else {
    editingPosts.value.add(id);
  }
};

const sendChangedPost = async (id: string) => {
  if (!editFormData.value[id]?.title?.trim() || !editFormData.value[id]?.body?.trim()) {
    err.value = "Please fill both title and body";
    return;
  }
  
  loading.value = true;
  err.value = "";
  try {
    // Отправляем запрос на обновление поста
    const response = await axios.patch(`/posts/${id}`, {
      title: editFormData.value[id].title,
      body: editFormData.value[id].body,
    });
    
    console.log("Post updated:", response.data);
    
    // Обновляем пост в списке
    const index = posts.value.findIndex(post => post.id === id);
    if (index !== -1) {
      posts.value[index] = response.data;
    }
    
    // Выходим из режима редактирования
    editingPosts.value.delete(id);
    
  } catch (error: any) {
    console.error("Error updating post:", error);
    
    // Если endpoint для обновления не реализован, показываем сообщение
    if (error.response?.status === 404 || error.response?.status === 405) {
      err.value = "Update functionality is not implemented on the server yet";
      // Выходим из режима редактирования
      editingPosts.value.delete(id);
    } else if (error instanceof Error) {
      err.value = error.message;
    } else {
      err.value = "Unknown error";
    }
  } finally {
    loading.value = false;
  }
};

const cancelEdit = (id: string) => {
  // Восстанавливаем исходные данные
  const post = posts.value.find(p => p.id === id);
  if (post) {
    editFormData.value[id] = {
      title: post.title,
      body: post.body
    };
  }
  // Выходим из режима редактирования
  editingPosts.value.delete(id);
};

onMounted(async () => {
  await getPost();
});
</script>

<template>
  <div class="app">
    <h1>📝 Blog Posts</h1>
    
    <!-- Форма создания нового поста -->
    <div class="card">
      <h2>➕ Create New Post</h2>
      <form @submit.prevent="sendPost" class="form">
        <input v-model="formData.title" type="text" placeholder="Title" :disabled="loading" />
        <input v-model="formData.body" type="text" placeholder="Content" :disabled="loading" />
        <button :disabled="loading" type="submit">
          {{ loading ? "Creating..." : "Create Post" }}
        </button>
      </form>
    </div>
    
    <!-- Сообщение об ошибке -->
    <div v-if="err" class="error">
      ❌ {{ err }}
    </div>
    
    <!-- Список постов -->
    <div class="posts-container">
      <h2>📋 All Posts ({{ posts.length }})</h2>
      
      <div v-if="loading && posts.length === 0" class="loading">
        ⏳ Loading posts...
      </div>
      
      <div v-else-if="!loading && posts.length === 0" class="empty">
        📭 No posts found
      </div>
      
      <div v-else class="posts">
        <div v-for="post in posts" :key="post.id" class="post card">
          <!-- Режим просмотра -->
          <div v-if="!editingPosts.has(post.id)" class="post-view">
            <div class="post-header">
              <span class="post-id">#{{ post.id }}</span>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-body">{{ post.body }}</p>
            
            <div class="post-actions">
              <button @click="deletePost(post.id)" class="btn delete-btn">
                🗑️ Delete
              </button>
              <button @click="openChangePost(post.id)" class="btn edit-btn">
                ✏️ Edit
              </button>
            </div>
          </div>
          
          <!-- Режим редактирования -->
          <div v-else class="post-edit">
            <div class="post-header">
              <span class="post-id">#{{ post.id }}</span>
              <span class="edit-label">✏️ Editing</span>
            </div>
            
            <form @submit.prevent="sendChangedPost(post.id)">
              <input 
                v-model="editFormData[post.id].title" 
                type="text" 
                placeholder="Title"
                class="edit-input"
              />
              <textarea 
                v-model="editFormData[post.id].body" 
                placeholder="Content"
                class="edit-textarea"
                rows="3"
              ></textarea>
              
              <div class="edit-actions">
                <button type="submit" class="btn save-btn" :disabled="loading">
                  💾 Save
                </button>
                <button 
                  type="button" 
                  @click="cancelEdit(post.id)" 
                  class="btn cancel-btn"
                  :disabled="loading"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1, h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form input {
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form input:focus {
  outline: none;
  border-color: #3498db;
}

.form button {
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.form button:hover:not(:disabled) {
  background: #2980b9;
}

.form button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #c62828;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 8px;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-view .post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-id {
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.edit-label {
  background: #fff3cd;
  color: #856404;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.post-title {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 20px;
}

.post-body {
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 20px;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.delete-btn {
  background: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}

.edit-btn {
  background: #f39c12;
  color: white;
}

.edit-btn:hover {
  background: #d68910;
}

.save-btn {
  background: #27ae60;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #229954;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-edit form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.edit-input, .edit-textarea {
  padding: 12px 15px;
  border: 2px solid #3498db;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
}

.edit-input:focus, .edit-textarea:focus {
  outline: none;
  border-color: #2980b9;
}

.edit-textarea {
  resize: vertical;
  min-height: 80px;
}

.edit-actions {
  display: flex;
  gap: 10px;
}
</style>