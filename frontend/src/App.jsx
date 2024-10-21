import { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Helper function to format date to yyyy-MM-dd
  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Fetch all tasks from the server
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Handle form submission (create or update task)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("due_date", formData.due_date);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (isEdit) {
        await axios.put(`http://localhost:3000/tasks/${currentId}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setIsEdit(false);
      } else {
        await axios.post("http://localhost:3000/tasks", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      fetchTasks();
      resetForm();
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  // Handle task delete
  const handleDelete = async (id) => {
    console.log("Deleting task with ID:", id);
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`http://localhost:3000/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  // Handle task edit
  const handleEdit = (task) => {
    setFormData({
      ...task,
      due_date: formatDate(task.due_date),
    });
    setIsEdit(true);
    setCurrentId(task.id);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
    });
  };

  return (
    <div className="container">
      {/* Task List Table */}
      <div className="task-table">
        <h2>Task List</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="5">No tasks available.</td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.priority}</td>
                  <td>{formatDate(task.due_date)}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(task)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(task.id)}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Task Form */}
      <form onSubmit={handleSubmit}>
        <h2>{isEdit ? "Update Task" : "Add Task"}</h2>
        <input
          type="text"
          placeholder="Task Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Task Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={formData.due_date ? formatDate(formData.due_date) : ""}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
        <button type="submit">{isEdit ? "Update Task" : "Add Task"}</button>
      </form>
    </div>
  );
};

export default App;
