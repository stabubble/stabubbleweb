import React, {useContext} from 'react';
import {useHistory} from 'react-router-dom';
import {Button, Page, Toolbar} from "react-onsenui";
import logo from '../images/logo512.png';
import {AppContext} from "../config";
import {motion} from "framer-motion";

function WelcomePage(props) {
    const history = useHistory();
    const appContext = useContext(AppContext);

    return (
        <Page renderToolbar={() =>
            <Toolbar>
                <div className="center" style={{textAlign: 'center'}}>
                    stabubble {appContext.status ? ` ${appContext.status}` : null}
                    {appContext.environment !== 'prod' ?
                        <span style={{color: 'red'}}> {appContext.environment}</span> : null}
                </div>
            </Toolbar>}
              contentStyle={{padding: 0, maxWidth: 768, margin: '0 auto'}}>
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',
                paddingLeft: 5, paddingRight: 5
            }}>
                <motion.div initial={{rotate: 360, scale: 0}} animate={{rotate: 0, scale: 1}}
                            transition={{duration: 0.5}} style={{paddingTop: 30}}>
                    <img src={logo} alt="stabubble logo"
                         style={{
                             width: '30%', display: 'block', marginLeft: 'auto', marginRight: 'auto',
                             borderRadius: 30
                         }}/>
                </motion.div>
                <div style={{paddingLeft: 10, paddingRight: 10, textAlign: 'center'}}>
                    <h1>st andrews anonymous chat
                        {appContext.status ?
                            <span> <sup style={{fontSize: 'medium'}}>{appContext.status}</sup></span> : null}
                        {appContext.environment !== 'prod' ?
                            <span style={{color: 'red'}}> {appContext.environment}</span> : null}</h1>
                </div>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={() => history.push('/agree')}>
                    join the bubble
                </Button>
                <Button modifier="large" style={{marginTop: 10, marginBottom: 10}}
                        onClick={() => history.push('/login')}>
                    enter the bubble
                </Button>
            </div>
        </Page>
    )
}

export default WelcomePage;