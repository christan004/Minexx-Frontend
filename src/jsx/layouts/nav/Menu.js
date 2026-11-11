import { Title } from "chart.js"

export const RootMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },
     {
        title:'Purchase',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'purchase',
    },
     {
        title: "Miners",
        iconStyle: <i className="fas fa-users" />,
        to: "3tsminers",
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },
    {
        title:'Tag Management',
        iconStyle: <i className="flaticon-381-price-tag"></i>,
        to: 'tag-management',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    },
    {
        title:'Reporting',
        to: 'reports',
        update:"New",
        iconStyle : <i className="flaticon-business-report" />,
        content: [
            {
                title: 'Trace Report',
                to: 'reports/trace',
            },
            {
                title:'KPIs',
                to:'reports/kpis'

            },
            {
                title:'Stock Movement',
                to:'reports/stockmovement'
            },
            {
                title:'Kyc Summary',
                to:'reports/kycsummary'
            },
             {
                title:'Delivery Grade Trends',
                to:'reports/deliverygradetrends'
            },
            {
                title:'Supplier Chemical Composition',
                to:'reports/suppliercomposition'
            },
              {
                title:'Export Chemical Composition',
                to:'reports/exportchemicalcomposition'
            },
            {
            title:'Supplier Sales Report',
            to:'reports/sale',
            },
            {
                title:'Supplier Delivery Trend',
                to:'reports/suppliertrends',
            },
            {
                title:'Trade Time Report',
                to:'reports/timetracking',
            }, 
            {
                title: 'Total Stock Delivery',
                to: 'reports/daily',
            },
            {
                title:'Shipped Report',
                to:'reports/shipped'
            },
            {
                title: 'In-Stock Country Balance',
                to: 'reports/mtd',
            },
            {
                title: 'Total Purchase',
                to: 'reports/deliveries',
            },

        ]
        
    },

    // Users
    {
        title: 'User Management',
        class: 'mm-collapse',
        iconStyle: <i className="flaticon-settings-1"></i>,
        content: [
            {
                title: 'Dashboard Users',
                to: '/users/dashboard',
            },
            {
                title: 'App Users',
                to: '/users/app',
            }
        ]
    }    
]

export const RegulatorMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },
     {
        title:'Purchase',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'purchase',
    },
     {
        title: "Miners",
        iconStyle: <i className="fas fa-users" />,
        to: "3tsminers",
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },
      {
        title:'Tags',
          iconStyle: <i className="fa fa-tags"></i>,
        to: 'Tags',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    },

    {
        title:'Reporting',
        to: 'reports',
        update:"New",
        iconStyle : <i className="flaticon-business-report" />,
        content: [
            {
                title: 'Trace Reports',
                to: 'reports/trace',
            },
            {
                title:'KPIs',
                to:'reports/kpis'

            },
             {
                title:'Stock Movement',
                to:'reports/stockmovement'
            },
             {
                title:'Delivery Grade Trends',
                to:'reports/deliverygradetrends'
            },
             {
                title:'Supplier Chemical Composition',
                to:'reports/suppliercomposition'
            },
            {
                title:'Export Chemical Composition',
                to:'reports/exportchemicalcomposition'
            },
            {
                title:'Kyc Summary', 
                to:'reports/kycsummary'
            },
            {
                title:'Supplier Sales Report',
                to:'reports/sale',
            },
            {
                title:'Supplier Delivery Trend',
                to:'reports/suppliertrends',
            },
            {
                title:'Trade Time Report',
                to:'reports/timetracking',
            }, 
            {
                title:'Shipped Report',
                to:'reports/shipped'
            },
            {
                title: 'Total Stock Delivery',
                to: 'reports/daily',
            },
            {
                title: 'In-Stock Country Balance',
                to: 'reports/mtd',
            },
            {
                title: 'Total Purchase',
                to: 'reports/deliveries',
            },
        ]

    }
    ,
        {
        title:'System Health',
        update:"New",
        iconStyle : <i className="flaticon-381-graph"></i>,
        to:'Systemhealth',
        },
]

export const BMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    },
    {
        title:'Reporting',
        to: 'reports',
        update:"New",
        iconStyle : <i className="flaticon-business-report" />,
        content: [
            {
                title:'Supplier Chemical Composition',
                to:'reports/suppliercomposition'
            },
        ]
        }
]

export const B_RWMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    }
]
export const B_drMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    }
]
export const IMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },
     {
        title:'Purchase',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'purchase',
    },
     {
        title: "Miners",
        iconStyle: <i className="fas fa-users" />,
        to: "3tsminers",
    },
    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },
      {
        title:'Tags',
          iconStyle: <i className="fa fa-tags"></i>,
          to: 'Tags',
    },

    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    },

    {
        title:'Reporting',
        to: 'reports',
        update:"New",
        iconStyle : <i className="flaticon-business-report" />,
        content: [
            {
                title: 'Trace Report',
                to: 'reports/trace',
            },
            {
                title:'KPIs',
                to:'reports/kpis'

            },
             {
                title:'Stock Movement',
                to:'reports/stockmovement'
            },
            {
                title:'Delivery Grade Trends',
                to:'reports/deliverygradetrends'
            },
             {
                title:'Supplier Chemical Composition',
                to:'reports/suppliercomposition'
            },
              {
                title:'Export Chemical Composition',
                to:'reports/exportchemicalcomposition'
            },
            {
                title:'Kyc Summary',
                to:'reports/kycsummary'
            },
            {
                title:'Supplier Sales Report',
                to:'reports/sale',
            },
            {
                title:'Supplier Delivery Trend',
                to:'reports/suppliertrends',
            },
            {
                title:'Trade Time Report',
                to:'reports/timetracking',
            }, 
            {
                title:'Shipped Report',
                to:'reports/shipped'
            },
            {
                title: 'Total Stock Delivery',
                to: 'reports/daily',
            },
            {
                title: 'In-Stock Country Balance',
                to: 'reports/mtd',
            },
            {
                title: 'Total Purchase',
                to: 'reports/deliveries',
            },
        ]

    }
    ,
        {
        title:'System Health',
        update:"New",
        iconStyle : <i className="flaticon-381-graph"></i>,
        to:'Systemhealth',
        },
]
// Togo specific menu for Gold-Togo access
export const TogoMenu = [
    {   
        title:'Overview',
        iconStyle: <i className="flaticon-layout"></i>,
        to: 'overview',
    },
    {
        title:'Purchase',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'purchase',
    },

    {   
        title:'Exports',
        iconStyle: <i className="flaticon-381-list"></i>,
        to: 'exports',
    },

    
    {   
        title:'Suppliers',
        iconStyle: <i className="flaticon-location"></i>,
        to: 'mines',
    },
 
    {
        title: 'Knowledge Base',
        iconStyle: <i className="flaticon-monitor"></i>,
        to: 'knowledge' 
    },
    {
        title:'Reporting',
        to: 'reports',
        update:"New",
        iconStyle : <i className="flaticon-business-report" />,
        content: [
            {
                title: 'Trace Report',
                to: 'reports/trace',
            },
            // {
            //     title:'KPIs',
            //     to:'reports/kpis'

            // },
           
            {
                title:'Kyc Summary',
                to:'reports/kycsummary'
            },
             {
                title:'Delivery Grade Trends',
                to:'reports/deliverygradetrends'
            },
            
            {
            title:'Supplier Sales Report',
            to:'reports/sale',
            },
            {
                title:'Supplier Delivery Trend',
                to:'reports/suppliertrends',
            },
           
            {
                title: 'Total Purchase',
                to: 'reports/deliveries',
            },

        ]
        
    },

    // Users
    {
        title: 'User Management',
        class: 'mm-collapse',
        iconStyle: <i className="flaticon-settings-1"></i>,
        content: [
            {
                title: 'Dashboard Users',
                to: '/users/dashboard',
            },
            {
                title: 'App Users',
                to: '/users/app',
            }
        ]
    }    
]
