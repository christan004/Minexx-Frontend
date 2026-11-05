import React from 'react';
import ReactDOM from 'react-dom/client';
//import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './store/store';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from '@vercel/analytics/react';
import { Worker } from '@react-pdf-viewer/core'
import { SpeedInsights } from "@vercel/speed-insights/react"
import  ThemeContext  from "./context/ThemeContext";
import axios from 'axios';

axios.create({
  baseURL: `https://pthxuif38b.execute-api.us-east-1.amazonaws.com/`
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store = {store}>
      <BrowserRouter basename='/'>
        <ThemeContext>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <App />
          </Worker>
          <Analytics/>
          <ToastContainer />
          <SpeedInsights/>
        </ThemeContext>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
