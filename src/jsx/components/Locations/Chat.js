import React from 'react';
import {Dropdown} from 'react-bootstrap';
import {Link} from 'react-router-dom';

import pic1 from './../../../images/avatar/1.jpg';
import pic2 from './../../../images/avatar/2.jpg';
import pic3 from './../../../images/avatar/3.jpg';
import pic4 from './../../../images/avatar/4.jpg';
import pic5 from './../../../images/avatar/5.jpg';
import pic6 from './../../../images/avatar/6.jpg';
import pic7 from './../../../images/avatar/7.jpg';
import pic8 from './../../../images/avatar/8.jpg';

const imageBlog = [
    {image:pic1},
    {image:pic2},
    {image:pic3},
    {image:pic4},
    {image:pic5},
    {image:pic6},
];

const contactList = [
    {image: pic4, title:'Product Team (32)', time:'10:30 AM'},
    {image: pic7, title:'Tony Soap', time:'11:00 AM'},
    {image: pic8, title:'Karen Hope', time:'11:15 AM'},
];
const contactList2 = [
    {image: pic3, title:'Product Team (32)', time:'10:30 AM'},
    {image: pic5, title:'Tony Soap', time:'12:10 PM'},
    {image: pic6, title:'Karen Hope', time:'12:45 AM'},
];

const Chat = () => {
    return (
        <>
            <div className="row page-titles">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active"><Link to={"#"}>Customer</Link></li>
                    <li className="breadcrumb-item"><Link to={"#"}>Chat</Link></li>
                </ol>
            </div>
            <div className="row">
                <div className="col-xl-3 col-xxl-5  chat-left-area">
                    <div className="card dlab-scroll chat-sidebar mb-0" id="chat-sidebar">
                        <div className="card-body">
                            <div className="message-box d-flex align-items-center justify-content-between">
                                <div className="input-group search-area">
                                    <input type="text" className="form-control" placeholder="Search here..." />
                                    <span className="input-group-text"><Link to={"#"}><i className="flaticon-381-search-2"></i></Link></span>
                                </div>
                                <button className="add btn btn-primary " data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 0C4.05 0 0 4.05 0 9C0 13.95 4.05 18 9 18C13.95 18 18 13.95 18 9C18 4.05 13.95 0 9 0ZM9 16.125C5.1 16.125 1.875 12.9 1.875 9C1.875 5.1 5.1 1.875 9 1.875C12.9 1.875 16.125 5.1 16.125 9C16.125 12.9 12.9 16.125 9 16.125Z" fill="#FCFCFC"/>
                                        <path d="M13.3498 8.02505H9.9748V4.65005C9.9748 4.12505 9.52481 3.67505 8.9998 3.67505C8.4748 3.67505 8.02481 4.12505 8.02481 4.65005V8.02505H4.6498C4.1248 8.02505 3.6748 8.47505 3.6748 9.00005C3.6748 9.52505 4.1248 9.97505 4.6498 9.97505H8.02481V13.35C8.02481 13.8751 8.4748 14.3251 8.9998 14.3251C9.52481 14.3251 9.9748 13.8751 9.9748 13.35V9.97505H13.3498C13.8748 9.97505 14.3248 9.52505 14.3248 9.00005C14.3248 8.47505 13.8748 8.02505 13.3498 8.02505Z" fill="#FCFCFC"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="chat-people">
                                <div className="d-flex justify-content-between">
                                    <h4 className="m-0 fs-18 font-w600">Contacts</h4>
                                    <Link to={"#"}>View All</Link>
                                </div>
                                <ul className="d-flex align-items-center justify-content-between mt-2 contact-list">
                                    {imageBlog.map((data, ind)=>(
                                        <li key={ind}><img src={data.image} alt="" /></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="chat-tabs">
                                <h4>Groups</h4>
                                <div className="course-details-tab style-2">
                                    <ul>
                                        {contactList.map((item, ind)=>(
                                            <li className={`chat-bx ${ind==2 ? "active" : ""}`} key={ind}>
                                                <div className="chat-img">
                                                    <img src={item.image} alt="" />
                                                </div>
                                                <div className="mid-info">
                                                    <h4 className="name">{item.title}</h4>
                                                    <span>Lorem ipsum dolor sit amet.</span>
                                                </div>
                                                <div className="right-info">
                                                    <p>{item.time}</p>      
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                            
                                </div>	
                            </div>
                            
                            <div className="chat-tabs">
                                <h4>Chats</h4>
                                <div className="course-details-tab style-2">
                                    <ul>
                                        {contactList2.map((item, ind)=>(
                                            <li className={`chat-bx chats ${ind==2 ? "active" : ""}`} key={ind}>
                                                <div className="chat-img">
                                                    <img src={item.image} alt="" />
                                                </div>
                                                <div className="mid-info">
                                                    <h4 className="name">{item.title}</h4>
                                                    <span>Lorem ipsum dolor sit amet.</span>
                                                </div>
                                                <div className="right-info">
                                                    <p>{item.time}</p>      
                                                </div>
                                            </li>
                                        ))}   
                                        
                                    </ul>
                            
                                </div>	
                            </div>
                            
                            <Link to={"#"} className="btn btn-primary  w-100"> View More</Link>
                        </div>
                    </div>
                </div>
                <div className="col-xl-9 col-xxl-7  chat-mid-area">
                    <div className="message-box style-1 d-flex align-items-center flex-wrap">
                        <img src={pic6} alt="" />
                        <div className="ms-2 ms-sm-3  flex-1 text-nowrap">
                            <h4>Product Design Team</h4>
                            <span>
                                32 Members, 12 Online
                            </span>
                        </div>
                        <div className="chat-hamburger">
                            <div className="chat-toggle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 24 24" version="1.1" className="svg-main-icon">
                                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                        <rect x="0" y="0" width="24" height="24"></rect>
                                        <rect fill="var(--primary)" x="4" y="4" width="7" height="7" rx="1.5"></rect>
                                        <path d="M5.5,13 L9.5,13 C10.3284271,13 11,13.6715729 11,14.5 L11,18.5 C11,19.3284271 10.3284271,20 9.5,20 L5.5,20 C4.67157288,20 4,19.3284271 4,18.5 L4,14.5 C4,13.6715729 4.67157288,13 5.5,13 Z M14.5,4 L18.5,4 C19.3284271,4 20,4.67157288 20,5.5 L20,9.5 C20,10.3284271 19.3284271,11 18.5,11 L14.5,11 C13.6715729,11 13,10.3284271 13,9.5 L13,5.5 C13,4.67157288 13.6715729,4 14.5,4 Z M14.5,13 L18.5,13 C19.3284271,13 20,13.6715729 20,14.5 L20,18.5 C20,19.3284271 19.3284271,20 18.5,20 L14.5,20 C13.6715729,20 13,19.3284271 13,18.5 L13,14.5 C13,13.6715729 13.6715729,13 14.5,13 Z" fill="var(--rgba-primary-3)" opacity="0.8"></path>
                                    </g>
                                </svg>
                            </div>
                            <div className="videos-player">
                                <Link to={"#"} className="videos-btn">
                                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.561 1.172C19.4256 1.08045 19.2699 1.02347 19.1074 1.00604C18.945 0.988603 18.7807 1.01125 18.629 1.072L14.954 2.542C14.8449 1.83596 14.4875 1.19201 13.946 0.726018C13.4045 0.260026 12.7144 0.00258053 12 0H3C2.20435 0 1.44129 0.316071 0.87868 0.87868C0.316071 1.44129 0 2.20435 0 3V11C0 11.7956 0.316071 12.5587 0.87868 13.1213C1.44129 13.6839 2.20435 14 3 14H12C12.7143 13.9975 13.4042 13.7402 13.9457 13.2744C14.4872 12.8086 14.8447 12.1649 14.954 11.459L18.629 12.929C18.7807 12.9896 18.945 13.0121 19.1075 12.9946C19.27 12.977 19.4257 12.9199 19.561 12.8282C19.6962 12.7365 19.807 12.6131 19.8835 12.4687C19.9601 12.3244 20.0001 12.1634 20 12V2C20 1.83663 19.96 1.67573 19.8835 1.53139C19.807 1.38705 19.6962 1.26365 19.561 1.172ZM12 12H3C2.73478 12 2.48043 11.8946 2.29289 11.7071C2.10536 11.5196 2 11.2652 2 11V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H12C12.2652 2 12.5196 2.10536 12.7071 2.29289C12.8946 2.48043 13 2.73478 13 3V11C13 11.2652 12.8946 11.5196 12.7071 11.7071C12.5196 11.8946 12.2652 12 12 12ZM18 10.523L15 9.323V4.677L18 3.477V10.523Z" fill="#FCFCFC"/>
                                    </svg>
                                </Link>	 
                            </div>
                            <Dropdown className="dropdown custom-dropdown mb-0">
                                <Dropdown.Toggle className="btn sharp btn-primary tp-btn i-false">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 24 24" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><rect x="0" y="0" width="24" height="24"></rect><circle fill="#000000" cx="12" cy="5" r="2"></circle><circle fill="#000000" cx="12" cy="12" r="2"></circle><circle fill="#000000" cx="12" cy="19" r="2"></circle></g></svg>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu dropdown-menu-end">
                                    <Dropdown.Item>Option 1</Dropdown.Item>
                                    <Dropdown.Item>Option 2</Dropdown.Item>
                                    <Dropdown.Item>Option 3</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                    
                    <div className="chart-content">
                        <div className="chat-box-area dlab-scroll" id="chartBox">
                            <div className="media my-4">
                                <div className="dz-media">
                                    <img src={pic5} alt="" />
                                </div>
                                <div className="message-received w-auto">
                                    <h5>Jordan</h5>
                                    <div>
                                        <p className="mb-2">
                                        Hello Nella!
                                        </p>
                                    </div>
                                    <div >
                                        <p className="mb-2">
                                            Can you arrange schedule for next meeting?
                                        </p>
                                        <span className="fs-14">12:45 PM</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="media mb-4 justify-content-end align-items-start">
                                <div className="message-sent w-auto">
                                    <h5>Natasha</h5>
                                    <div>
                                        <p className="mb-2">
                                        Hello Karen!
                                        </p>
                                        <span className="fs-12">9.30 AM</span>
                                    </div>
                                    <div>
                                        <p className="mb-2">
                                            Okay, I’ll arrange it soon. i noftify you when it’s done
                                        </p>
                                        <span className="fs-12">9.30 AM</span>
                                    </div>
                                </div>
                                <div className="dz-media ms-2">
                                    <img src={pic1} alt="" />
                                </div>
                            </div>
                            <div className="media mb-4 justify-content-end align-items-start">
                                <div className="message-sent">
                                    <h5>Natasha</h5>
                                    <div>
                                        <p className="mb-2">
                                            Okay, I’ll arrange it soon. i noftify you when it’s done
                                            <br />
                                            +91-235 2574 2566
                                            <br />
                                            kk Sharma
                                            <br />
                                            pan card eeer2063i
                                        </p>
                                        <span className="fs-12">9.30 AM</span>
                                    </div>
                                </div>
                                <div className="dz-media ms-2">
                                    <img src={pic2} alt="" />
                                </div>
                            </div>
                            <div className="media my-4">
                                <div className="dz-media">
                                    <img src={pic3} alt="" />
                                </div>
                                <div className="message-received w-auto">
                                    <h5>Jordan</h5>
                                    <div>
                                        <p className="mb-2">
                                        Hello Nella!
                                        </p>
                                    </div>
                                    <div >
                                        <p className="mb-2">
                                            Can you arrange schedule for next meeting?
                                        </p>
                                        <div className="dz-media">
                                            <img src={pic4} alt="" />
                                        </div>
                                        <span className="fs-14">12:45 PM</span>
                                    </div>
                                </div>
                            </div>							
                        </div>
                        <div className="type-massage">
                            <div className="input-group">
                                <textarea className="form-control" placeholder="Write your message..."></textarea>
                                <div className="input-group-append">
                                    <button type="button" className="btn share-btn">
                                        <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14.3251 34.2002C13.0909 34.1974 11.8852 33.8294 10.86 33.1424C9.83471 32.4555 9.03576 31.4804 8.56385 30.3401C8.09194 29.1997 7.96819 27.9452 8.20821 26.7346C8.44823 25.5241 9.04126 24.4117 9.91256 23.5377L20.5126 12.9252C20.8614 12.5763 21.2755 12.2996 21.7313 12.1108C22.187 11.9221 22.6755 11.8249 23.1688 11.8249C23.6621 11.8249 24.1506 11.9221 24.6064 12.1108C25.0621 12.2996 25.4762 12.5763 25.8251 12.9252C26.1739 13.274 26.4506 13.6881 26.6394 14.1439C26.8282 14.5996 26.9253 15.0881 26.9253 15.5814C26.9253 16.0747 26.8282 16.5632 26.6394 17.019C26.4506 17.4747 26.1739 17.8888 25.8251 18.2377L15.2126 28.8377C15.1005 28.9685 14.9626 29.0748 14.8075 29.1498C14.6524 29.2248 14.4835 29.267 14.3114 29.2736C14.1392 29.2803 13.9676 29.2513 13.8072 29.1884C13.6468 29.1256 13.5011 29.0303 13.3792 28.9085C13.2574 28.7866 13.1621 28.641 13.0993 28.4806C13.0364 28.3201 13.0074 28.1485 13.0141 27.9763C13.0207 27.8042 13.0629 27.6353 13.1379 27.4802C13.2129 27.3251 13.3192 27.1872 13.4501 27.0752L24.0501 16.4627C24.2548 16.2235 24.3619 15.9159 24.3497 15.6013C24.3375 15.2867 24.2071 14.9883 23.9845 14.7657C23.7619 14.5431 23.4635 14.4127 23.1489 14.4005C22.8343 14.3884 22.5267 14.4954 22.2876 14.7002L11.6751 25.3002C10.9706 26.0046 10.5748 26.9601 10.5748 27.9564C10.5748 28.9527 10.9706 29.9082 11.6751 30.6127C12.3795 31.3171 13.335 31.7129 14.3313 31.7129C15.3276 31.7129 16.2831 31.3171 16.9876 30.6127L27.5876 20.0002C28.726 18.8214 29.356 17.2426 29.3418 15.6039C29.3275 13.9652 28.6702 12.3976 27.5114 11.2388C26.3526 10.08 24.785 9.42268 23.1463 9.40844C21.5076 9.3942 19.9288 10.0242 18.7501 11.1627L12.5626 17.4127C12.3284 17.6455 12.0115 17.7761 11.6813 17.7761C11.3511 17.7761 11.0343 17.6455 10.8001 17.4127C10.6829 17.2964 10.5899 17.1582 10.5264 17.0059C10.463 16.8535 10.4303 16.6902 10.4303 16.5252C10.4303 16.3601 10.463 16.1968 10.5264 16.0444C10.5899 15.8921 10.6829 15.7539 10.8001 15.6377L16.9876 9.38765C18.6286 7.74663 20.8543 6.82471 23.1751 6.82471C25.4958 6.82471 27.7215 7.74663 29.3626 9.38765C31.0036 11.0287 31.9255 13.2544 31.9255 15.5752C31.9255 17.8959 31.0036 20.1216 29.3626 21.7627L18.7501 32.3752C18.1686 32.9552 17.4785 33.4149 16.7192 33.728C15.9599 34.0412 15.1464 34.2016 14.3251 34.2002Z" fill="#01A3FF"/>
                                        </svg>
                                    </button>
                                    <Dropdown className="dropdown custom-dropdown mb-0">
                                        <Dropdown.Toggle className="btn sharp btn-primary tp-btn i-false">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 24 24" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><rect x="0" y="0" width="24" height="24"></rect><circle fill="#000000" cx="12" cy="5" r="2"></circle><circle fill="#000000" cx="12" cy="12" r="2"></circle><circle fill="#000000" cx="12" cy="19" r="2"></circle></g></svg>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="dropdown-menu dropdown-menu-end" align="end">
                                            <Dropdown.Item>Option 1</Dropdown.Item>
                                            <Dropdown.Item>Option 2</Dropdown.Item>
                                            <Dropdown.Item>Option 3</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <button type="button" className="btn btn-primary rounded text-white">
                                        <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17.466 0.0554752L0.96597 6.80548C0.816794 6.8708 0.692728 6.98259 0.612274 7.12419C0.53182 7.26578 0.499288 7.42958 0.519529 7.59117C0.53977 7.75276 0.6117 7.90348 0.724592 8.02085C0.837484 8.13822 0.98529 8.21596 1.14597 8.24248L9.14097 9.35923L10.2577 17.3542C10.2807 17.5174 10.3567 17.6685 10.4741 17.7841C10.5915 17.8997 10.7437 17.9735 10.9072 17.994C10.9381 17.9978 10.9691 17.9998 11.0002 18C11.149 17.9999 11.2944 17.9556 11.418 17.8727C11.5415 17.7897 11.6376 17.6719 11.694 17.5342L18.444 1.03423C18.4967 0.897557 18.5087 0.748508 18.4784 0.60517C18.4481 0.461832 18.3769 0.330368 18.2733 0.226735C18.1698 0.123102 18.0384 0.0517551 17.8951 0.0213547C17.7517 -0.0090457 17.6027 0.00280736 17.466 0.0554752ZM11.3587 14.3925L10.5502 8.59048C10.5275 8.42922 10.453 8.27973 10.3379 8.16459C10.2227 8.04944 10.0732 7.9749 9.91197 7.95223L4.10772 7.14148L16.3792 2.12098L11.3587 14.3925Z" fill="#FCFCFC"/>
                                            </svg>
                                            
                                        {" "}<span>Send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};



export default Chat;
