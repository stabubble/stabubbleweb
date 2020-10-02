import React from 'react';

function NewText(props) {
    return (
        <div style={{position: 'relative'}}>
        <textarea className="textarea" rows="10" placeholder="what do you want in your bubble?"
                  style={{width: '100%', backgroundColor: 'white', fontFamily: 'Grandstander'}}
                  onChange={(ev) => props.setData(ev.target.value)}
                  value={props.data}
        />
            <div style={{position: 'absolute', right: 10, bottom: 10}}>
                {props.maxLength - props.data.length}
            </div>
        </div>
    )
}

export default NewText;