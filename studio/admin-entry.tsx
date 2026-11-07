import React from 'react';
import {createRoot} from 'react-dom/client';
import Dashboard from './app/admin/dashboard';
import './app/admin/globals.css';
createRoot(document.getElementById('root')!).render(<Dashboard/>);
