import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import './style.css';
import './comment_list.css';
import {BsFillPersonFill} from 'react-icons/bs';
import {FaAngleUp, FaAngleDown} from 'react-icons/fa'
import {BsDot} from 'react-icons/bs';
import {AiFillEdit} from 'react-icons/ai';
import {VscChromeClose} from 'react-icons/vsc';
import {RiDeleteBinLine} from 'react-icons/ri';
import { v4 as uuidv4 } from 'uuid';

type Comment = {
    _id: string,
    owner:string;
    createdAt:number;
    text:string,
    children: string[], // these are ids of other comments
}

type CommentsDictionary = {
    [key:string]: Comment
}

const Main = () => {

    const [typedComment, set_typedComment] = useState('');

    const [list, set_list] = useState<Comment[]>([]);

    const [prevUserNames, set_prevUserNames] = useState(['']);
    const [userName, set_userName] = useState('');
    // dictionary
    const [commentsDictionary, set_commentsDictionary] = useState<CommentsDictionary>({});
    
    

    const editComment = (_id: string,action:'delete'|'reply'|'share'|'edit', payload:{ newComment?:Comment, editable?:string}) => {
        
        // get comment
        const gotComment = {...commentsDictionary[_id]};
        console.log({gotComment,_id});
        switch(action){
            case 'reply': 
                if(payload.newComment){
                    payload.newComment.owner = userName;
                    gotComment.children.push(payload.newComment._id); // set heirarchy

                    const Payload = {
                        ...commentsDictionary,
                        [gotComment._id]: gotComment, // add to heirarchy
                        [payload.newComment._id]:payload.newComment // add to dictionary
                    }
                    set_commentsDictionary(Payload)
                    localStorage.setItem('commentDictionary', JSON.stringify(payload));
                }; break;
            case 'edit':
                if(!!payload.editable){
                    gotComment.text = payload.editable;
                    const Payload = {
                        ...commentsDictionary,
                        [gotComment._id]: gotComment, // add to heirarchy
                    }
                    set_commentsDictionary(Payload)
                    localStorage.setItem('commentDictionary', JSON.stringify(payload));
                }; break;
            case 'delete':
                let Payload = {
                    ...commentsDictionary
                };
                delete Payload[_id];
                set_commentsDictionary(Payload)
                localStorage.setItem('commentDictionary', JSON.stringify(payload));      
                break;          
        }

        
    }

    // stores the required data into local storage so that comments are refetched on refresh
    const store_into_local = useCallback(() => {
        localStorage.setItem('commentDictionary', JSON.stringify(commentsDictionary));

        const arr_to_obj = () => {
            let obj_:any = {};
            list.forEach((item,i)=> obj_[i.toString()] = item);
            return obj_;
        }

        localStorage.setItem('list', JSON.stringify(arr_to_obj()));
    },[commentsDictionary, list])

    const retrieve_from_local = () => {
        const aa =  localStorage.getItem('commentDictionary');
        const list =  localStorage.getItem('list');
        console.log({aa,list})
        
        if(aa && list) {
            const aa_parsed = JSON.parse(aa);
            const list_parsed = JSON.parse(list);
            console.log({aa_parsed,list_parsed})

            const list_arr = Object.values(list_parsed);
            set_list(list_arr as any);
            set_commentsDictionary(aa_parsed);

        }

        // if(aa){
        //     set_commentsDictionary(JSON.parse(aa));
        // }
    }

    useEffect(() => {
        if(list.length === 0 && Object.keys(commentsDictionary).length === 0) {
            console.log('retrieving');
            retrieve_from_local();
        }
        
        if(list.length>0 || Object.keys(commentsDictionary).length){
            // save to local storage
            console.log('saving');
            store_into_local();
        }
    }, [commentsDictionary, list.length, store_into_local]);

    const x = {
        typedComment,
        set_typedComment,
        commentsDictionary,
        set_commentsDictionary,
        list,
        set_list, 
        
        prevUserNames, set_prevUserNames,
        userName,set_userName,

        store_into_local,
        retrieve_from_local,

        editComment
    }

    return(
        <div className='top' >
            {/* console purpose */}
            <div
             style={{height:'5rem', border:'2px solid red', width:'100%'}}
             onClick={()=>{
                 console.log({
                     list,commentsDictionary,typedComment
                    })
                }} 
            />

            <UserName x={x} />
            <SearchSection x={x} />
                
            <div className='header' style={{border:'2px solid green'}}>
                <CommentsInput  x={x} />
                <ViewComments x={x} />
            </div>
        </div>
)}

export default Main;


type setAnything<T> = React.Dispatch<React.SetStateAction<T>>

interface RootExtension {
    x:{
        typedComment: string, // placeholder for this = 'Join the discussion...'
        set_typedComment: setAnything<string>,
        commentsDictionary: CommentsDictionary,
        set_commentsDictionary: setAnything<CommentsDictionary>,
        list: Comment[],
        store_into_local : () => void,
        retrieve_from_local : () => void,

        prevUserNames: string[], 
        set_prevUserNames : setAnything<string[]> ,
        userName:string,
        set_userName: setAnything<string>,

        set_list: setAnything<Comment[]>,
        

        editComment: (_id: string, action: 'delete' | 'reply' | 'share'|'edit', payload:{ newComment?:Comment, editable?:string}) => void
    }
}

// input_section
const CommentsInput = ({x}:RootExtension) => {
    return(
        <div className='grid input_section  '>
            <div className='grid pic' >
                <BsFillPersonFill style={{fontSize:'inherit', color:'inherit', opacity:0.5}} />
            </div>

            <div className='grid input_box' onClick={()=> x.userName.length===0 && alert('Please enter a username first')} >
                <input className='input_itself' value={x.typedComment} 
                onChange={(e) => x.set_typedComment(e.currentTarget.value)} 
                maxLength={200}
                onBlur={()=>{
                    if(Object.values(x.commentsDictionary).some(z => z.owner === x.userName )){
                        alert('Username already made an entry. User new username');
                        x.set_userName('');
                        return;
                    }
                    if(x.typedComment.length === 0) return;

                    const _id = uuidv4();
                    const newComment: Comment = {
                        _id,
                        owner: x.userName,
                        createdAt: Date.now(),
                        text: x.typedComment,
                        children: []
                    }
                    // add to list
                    x.set_list([...x.list, newComment])

                    // add to dictionary
                    x.set_commentsDictionary({
                        ...x.commentsDictionary,
                        [_id]: newComment
                    })
                    x.set_typedComment('')

                    
                }}
                placeholder='Join the discussion...' />
            </div>
        </div>
)}

// list of comments
const ViewComments = ({x}:RootExtension) => {
    // const arr = Object.values(x.list);
    return(
        <div className='comment_section'>
            {
                x.list.map((comment,i)=>{
                    return(
                        <CommentLine key={i} comment={comment} x={x}   />
                    )
                })
            }
        </div>
    )
}


// comment_line
interface CommentLineProps extends RootExtension{
    comment:Comment, 
}
const CommentLine = ({comment, x }:CommentLineProps) => { 

    // when user tries to reply to someone, capture the input here
    const [replied, set_replied] = useState('');
    const [collapse, set_collapse] = useState(false);
    
    const x2={
        collapse,set_collapse
    }

    return(
        <div className='listItem'>
            {/* pic */}
            <div style={{gridArea:'pic'}} className='pic-box'>
                <BsFillPersonFill style={{fontSize:'inherit', color:'inherit', opacity:0.5}} />
            </div>

            {/* title-area */}
            <TitleRow comment={comment} x={x} /> 

            {/* comment-body */}
            <div style={{gridArea:'body'}} className='body-area' >
                {comment.text} 
            </div>

            {/* collapsible-reply-share options */}
            <div style={{gridArea:'collapsible-controller'}} className='body-area' >
                <CollapsibleController comment={comment} x={x} x2={x2} />
            </div>

            {/* collapsible-input-area */}
            <div className='collapsible-input-area' style={{gridArea:'collapsible-main', display: collapse?'none':'grid' }}>
                <div className='input_box grid' >
                    <input placeholder='replying...' onChange={(e)=>{
                            set_replied(e.currentTarget.value)
                        }}
                        value={replied}
                        maxLength={200}
                        onBlur={()=>{
                            if(Object.values(x.commentsDictionary).some(z => z.owner === x.userName )){
                                alert('Username already made an entry. User new username');
                                x.set_userName('');
                                return;
                            }
                            if(replied.length === 0) return;

                            const _id = uuidv4();
                            const newComment: Comment = {
                                _id,
                                owner: x.userName,
                                createdAt: Date.now(),
                                text: replied,
                                children: []
                            }
                            // add to self list, not main 
                            x.editComment(comment._id, 'reply', {newComment});

                            // add to dictionary
                            x.set_commentsDictionary({
                                ...x.commentsDictionary,
                                [_id]: newComment
                            })
 

                                set_replied('');
                        }}
                    />
                </div>
            </div>

            {/* children-comments */}
            <ChildrenCommentSection _ids={ x.commentsDictionary[comment._id].children} x={x} x2={x2} />
            {/* <div>

            </div> */}
        </div>
)}

// children-comments
interface ChildrenCommentSectionProps extends RootExtension {
    _ids:string[], 
    x2:{
        collapse:boolean,
        set_collapse: setAnything<boolean>,
    }
}

const ChildrenCommentSection = (p:ChildrenCommentSectionProps) => {

    const comments = () =>{
        return p._ids.map((_id,i)=>{
            return(
                p.x.commentsDictionary.hasOwnProperty(_id)? p.x.commentsDictionary[_id] : null
            )
        })
    }

    return(
        <div className='children-comments' style={{gridArea:'children-comments'   }} >
            {
                comments().map((comment,i)=>{
                    if(!!comment){
                        return(
                            <div key={i} style={{maxHeight: p.x2.collapse? '0':'80vh'}} className='collapse-action' >
                                <CommentLine comment={comment} x={p.x} />
                                {/* {comment.text} */}
                            </div>
                        )
                    }else return <div />
                })
            }
        </div>
    )
}

// --------------------------------------------------------------------

// interface TitleRowProps {
//     comment: Comment,
// }

const TitleRow = (p:CommentLineProps) => {

    const minutes = (createdAt:number) => {
        // const one_minute_in_milliseconds = 60000;
        const one_millisecond_in_minute = 1/60000;
        const now = Date.now();
        const diff = now - createdAt;
        const diff_in_minutes = one_millisecond_in_minute * diff;
        return diff_in_minutes;
    }

    const [showPopup, set_showPopup] = useState(false);


    return(
        <div className='title-row'>
            <div className='title-item'>
                {p.comment.owner}
            </div>
            <div style={{
                color:'grey'
            }} >
                { Math.floor( minutes(p.comment.createdAt) ) } minute(s) ago
            </div>

            <AiFillEdit onClick={() => set_showPopup(true)}  style={{fontSize:'1.5rem', cursor: 'pointer'}} />

            <EditPopup show={showPopup} comment={p.comment} x={p.x} x3={{
                showPopup,set_showPopup
            }}  />

            <RiDeleteBinLine style={{fontSize:'1.5rem', cursor: 'pointer'}}
                onClick={() => {
                    p.x.editComment(p.comment._id,'delete',{})
                }}
            />

            {/* large gapping purpose */}
            <div/>
        </div>
)}


interface EditPopupProps extends CommentLineProps {
    show:boolean,
    x3: {
        showPopup: boolean,
        set_showPopup: setAnything<boolean>
    }
}

const EditPopup = (p:EditPopupProps) => {

    const [edited, set_edited] = useState(p.comment.text);
    

    return(
        <div className='popup' style={{display:p.show?'grid':'none'}} >
            

            <div > 
                <input value={edited} onChange={(e)=> set_edited(e.currentTarget.value)}
                    style={{width:'96%'}}
                    maxLength={200}
                    onBlur={() => {
                        p.x.editComment(p.comment._id,'edit',{editable:edited})
                        p.x3.set_showPopup(false);
                    }}
                />
            </div>

            <div  onClick={() => p.x3.set_showPopup(false) }>
                <VscChromeClose style={{color:'white', fontSize:'2rem', }} />
            </div>
            {/* <div style={{}} className='closeBtn' >
            </div> */}
        </div>
    )
}

interface CollapsibleControllerProps extends RootExtension {
    comment:Comment,
    x2:{
        collapse:boolean,
        set_collapse: setAnything<boolean>,
    }
}

const dot_icons= () => <BsDot style={{fontSize:'1rem', opacity:0.4, padding:'0.3rem 0 0'}} />

const CollapsibleController = ({comment,x,x2}:CollapsibleControllerProps) => {
    return(
        <div className='collapsible-controller' >

            {/* count replies */}
            <div className='controller-item' style={{fontWeight:'bold'}} >
                {comment.children.length}
            </div>

            <div className='iconWrapper controller-item' onClick={(e)=>{
                e.stopPropagation();
                x2.set_collapse(false)} 

            }
                style={{color: !x2.collapse?'dodgerblue':''}}
            >
                <FaAngleDown style={{fontSize:'inherit',color:'inherit'}} />
            </div>

            <div  style={{border:'1px solid grey'}} />

            <div className='iconWrapper controller-item' onClick={(e)=>{
                e.stopPropagation();
                x2.set_collapse(true)} 
            }
            style={{color: x2.collapse?'dodgerblue':''}}
            >
                <FaAngleUp style={{fontSize:'inherit',color:'inherit'}} />
            </div>

           {dot_icons()}

            <div className='controller-item' onClick={() => {
                // x.set_collapse(true)
            }}>
                Reply
            </div>

           {dot_icons()}


            <div className='controller-item'>
                Share
            </div>

           {dot_icons()} 

            {/* large gapping purpose */}
            <div/>
        </div>
    )
}

// ------------------- SEARCH SECTION

const SearchSection = (p:RootExtension) => {

    const [collapse, set_collapse] = useState(true);

    return(
        <div className='searchBox_wrapper'>
            <div className='searchBox_inputWrapper'>
                <input style={{width:'98%'}} placeholder='search...' 
                maxLength={200}
                onFocus={()=> set_collapse(false)} 
                    onBlur={() => set_collapse(true)}
                />
            </div>

            <div className={'searchBox_collapsible'} 
                style={{
                    boxShadow: collapse ? '':'0 0 20px 2px rgba(0,0,0,0.5)',
                    maxHeight: collapse? '0':'10rem',
                    overflow:'auto'
                }}
            >
                {
                    Object.values(p.x.commentsDictionary).map((comment,i)=>{
                        return(
                            <div key={i} className={'card'} >
                                {comment.text}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

// ------------------- username entry

const UserName = (p:RootExtension) => {

    return(
        <div className='userName_wrapper' >
            <div style={{fontSize:'1.3rem'}} >
                USERNAME = {p.x.userName}
            </div>
            <input style={{border:'2px solid grey'}} 
            maxLength={200}
            placeholder='Enter your name here'
            value={p.x.userName} onChange={(e) => p.x.set_userName(e.currentTarget.value)} />
        </div>
    )
}