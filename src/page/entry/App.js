

import './App.css'


import React, { useContext, useEffect, useState} from 'react';
import {Routes, Route, useNavigate, BrowserRouter, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import BlogHeader from '../blog/Header.js'
import BlogHome  from '../blog/Home.js'
import Article  from '../blog/Article.js'
import MainHeader from '../main/Header.js'
import MainHome from '../main/Home.js'

import SettingUser from '../user/SettingUser.js'
import User from '../user/User.js'
import Regist from '../user/Regist.js'
import Login from '../user/Login.js'

import Writer from '../markdown/Writer.js'
import Posting from '../markdown/Posting.js'
import ErrorBoundary from './ErrorBoundary.js'
import PageNotFound from './PageNotFound.js'

import AuthProvider from '../../util/AuthProvider.js'
import ToastContainer from '../../common/ToastContainer.js'


export default function() {

  const RootLayout = () => (

    <div style={{width:'100%', height:'100%', display:'flex', flexDirection: 'column'}}>
      <MainHeader/>
      <div style={{height:'30px', maxHeight:'30px', minHeight:'30px'}}/>
      <Outlet/>
    </div>
  )


  const BlogLayout = () => (
    
    <div style={{width:'100%', height:'100%', display:'flex', flexDirection: 'column'}}>
      <BlogHeader/>
      <div style={{height:'30px', maxHeight:'30px', minHeight:'30px'}}/>
      <Outlet/>
    </div>
  )


  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <MainHome/>},
        { path: 'account', children: [
          { index: true, element: <Login/>},
          { path: 'regist', element: <Regist/>}]
        },
        { path: 'user/:id', children: [
          { index: true, element: <User/>},
          { path: 'setting', element: <SettingUser/>}]
        },
        { path: 'pageNotFound', element: <PageNotFound/>}
      ],
      errorElement: <PageNotFound />
    },
    {
      path: "/blog/:b_id",
      element: <BlogLayout />,
      children: [
        { index: true, element: <BlogHome/>},
        { path: 'article/:a_id', children: [
          { index: true, element: <Article/>}        
        ]},
        { path: 'write', children: [
          { index: true, element: <Writer/>},
          { path: 'posting', element: <Posting/>}
        ]}
      ]
    }
  ])

  return (
      <ErrorBoundary>
        <AuthProvider>
          <ToastContainer />
            <RouterProvider router={router}/>
        </AuthProvider>
      </ErrorBoundary>
  )
}
