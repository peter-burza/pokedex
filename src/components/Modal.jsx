import ReactDom from 'react-dom'

export default function Modal(props) { // Creates a fullscreen overlay on top of the page for any details you want
    const { children, handleCloseModal } = props
    return ReactDom.createPortal(
        <div className='modal-container'>
            <button onClick={handleCloseModal} className='modal-underlay' />
            <div className='modal-content'>
                {children} {/*</div> children property is like what you put between the opening and closing tags of a component, that will be rendered inside this <div>*/}
            </div>
        </div>,
        document.getElementById('portal')
    )
}