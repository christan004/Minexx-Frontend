import React, { useEffect, useContext, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import { ThemeContext } from '../../../context/ThemeContext';
import { translations } from './TrackingTranslation';
import axiosInstance from '../../../services/AxiosInstance';
import { toast } from 'react-toastify';

const Tracking = ({ language, country }) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { changeTitle } = useContext(ThemeContext);
  const [tracking, setTracking] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Admin Tasks');
  const [completionPercentage, setCompletionPercentage] = useState('0%');
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  const t = (key) => {
    if (!translations[language]) {
      console.warn(`Translation for language "${language}" not found`);
      return key;
    }
    return translations[language][key] || key;
  };

  const categories = [
    'Admin Tasks',
    'Ground Crew Tasks',
    'Mineral Labs Tasks',
    'Operations Supervisor Tasks',
    'Comptoir Trade Manager Tasks',
    'Comptoir Director Tasks',
    'Operations Manager Tasks',
    'Finance Tasks',
    'Mining Board Regulator Agent Tasks', 
    'Transporter Tasks',
  ];

  const timeTracking = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/timeTracking`, {
        params: {
          id: id
        }
      });

      if (response.data.success) {
        const trackingData = response.data.timeTracking[0];
        setTracking(trackingData);
        console.log("time Tracking", trackingData);
        
        // Calculate percentage and display it
        const percentageValue = calculateCompletionPercentage(trackingData);
        setCompletionPercentage(`${percentageValue}%`);
        
        // Set days left based on duration
        if (trackingData && trackingData.duration) {
          // Using the duration value from the database
          setDaysLeft(parseInt(trackingData.duration) || 0);
        } else {
          // Default to 0 if duration is not available
          setDaysLeft(0);
        }
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      //toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionPercentage = (data) => {
    if (!data) return 0;
      
    // Define all non-task properties to exclude
    const nonTaskProperties = [
      'id', 
      'exportationID', 
      'duration', 
      'created at', 
      'updated at',
      'Percentage',
    ];
    
    let totalTasks = 0;
    let completedTasks = 0;
      
    // Only count properties that are actual tasks
    Object.keys(data).forEach(key => {
      // Check if the key represents a task by making sure it's in one of your categories
      const isTask = categories.some(category => key.startsWith(category));
      
      // Only count it if it's a task and not in the exclusion list
      if (isTask && !nonTaskProperties.includes(key)) {
        totalTasks++;
        if (data[key] === 1) {
          completedTasks++;
        }
      }
    });
      
    // Ensure we don't divide by zero
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getTasksForCategory = (category) => {
    if (!tracking) return [];
    
    const tasks = [];
    Object.keys(tracking).forEach(key => {
      if (key.startsWith(category)) {
        const taskName = key.replace(`${category} `, '');
        tasks.push({
          name: taskName,
          key: key,
          completed: tracking[key] === 1
        });
      }
    });
    
    return tasks;
  };

  // Function to check if all tasks in a category are completed
  const isCategoryCompleted = (category) => {
    if (!tracking) return false;
      
    const tasks = getTasksForCategory(category);
    if (tasks.length === 0) return false;
    
    return tasks.every(task => task.completed);
  };

  // Function to handle task completion toggle
  const toggleTaskCompletion = async (taskKey) => {
    if (!tracking || loading) return;
    
    try {
      setLoading(true);
      
      // Create a new tracking object with the updated task
      const updatedTracking = { ...tracking };
      updatedTracking[taskKey] = updatedTracking[taskKey] === 1 ? 0 : 1;
      
      // Calculate the new percentage
      const newPercentage = calculateCompletionPercentage(updatedTracking);
      
      // Create update fields object
      const updateFields = {
        [taskKey]: updatedTracking[taskKey],
        Percentage: newPercentage // Add completion percentage to the update fields
      };
      
      // Update the task and the percentage in the database
      const response = await axiosInstance.put(`/timeTracking/update`, {
        id: updatedTracking.exportationID,
        ...updateFields // Spread the update fields in the request body
      });
      
      if (response.data.success) {
        // Update the local state with tracking data
        setTracking(updatedTracking);
        setCompletionPercentage(`${newPercentage}%`);
        
        toast.success("Task updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task: ", error);
      toast.error(error.response?.data?.message || "Error updating task");
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate background color for days left
  const getDaysLeftBackgroundColor = () => {
    if (daysLeft <= 10) {
      return 'bg-danger'; // Red warning color when 10 days or less
    }
    return 'bg-info'; // Default color
  };

  useEffect(() => {
    changeTitle(t('Time Tracking | Minexx'));
    timeTracking(id);
  }, [id, language, country]);

  return (
    <div>
      <div className="row page-titles">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active"><Link to={"/overview"}>{t("Dashboard")}</Link></li>
          <li className="breadcrumb-item"><Link to={"/Exports"}>{t("Exports")}</Link></li>
          <li className="breadcrumb-item"><Link to={""}>{t("Time Tracking")}</Link></li>
        </ol>
      </div>

      <div className="row">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{t("Time Tracking")}: <span className="text text-primary">{completionPercentage} {t("Completed")}</span></h2>
          <div className={`text-white p-3 rounded ${getDaysLeftBackgroundColor()}`}>
            <h1 className="m-0">{daysLeft}</h1>
            <div>{t('Days More')}</div>
          </div>
        </div>

        <div className="col-xl-3">
          <ListGroup className="mb-4">
            {categories.map((category, i) => (
              <ListGroup.Item 
                key={i} 
                onClick={() => setSelectedCategory(category)} 
                action 
                active={selectedCategory === category}
                className="d-flex align-items-center"
              >
                <div 
                  className={`me-2 rounded-circle d-flex justify-content-center align-items-center ${isCategoryCompleted(category) ? 'bg-primary' : 'bg-light'}`} 
                  style={{ width: '20px', height: '20px' }}
                >
                  {isCategoryCompleted(category) && <i className="fa fa-check text-white"></i>}
                </div>
                {t(category)}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        <div className="col-xl-9">
          <div className="card">
            <div className="card-body">
              <div className="row">
                {loading && !tracking ? (
                  <div className="col-12 text-center">
                    <p>{t('Loading...')}</p>
                  </div>
                ) : tracking ? (
                  getTasksForCategory(selectedCategory).map((task, i) => (
                    <div key={i} className="col-12 mb-3">
                      <div 
                        className="p-3 border rounded d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleTaskCompletion(task.key)}
                      >
                        <span>{t(task.name)}</span>
                        <div 
                          className={`rounded-circle d-flex justify-content-center align-items-center ${task.completed ? 'bg-primary' : 'bg-light'}`} 
                          style={{ width: '24px', height: '24px' }}
                        >
                          {task.completed && <i className="fa fa-check text-white"></i>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p>{t('No data available')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 

export default Tracking;