import './App.css';
import React from 'react';

class Technicals extends React.Component {

    constructor() {
        super();
        this.state = {};
    }

    render() {
        let technicals = this.props.search.state.technicalsDisplayList;
        let trendStrength = this.props.search.state.trendStrengthDisplayList;

        return (
            <div className='card' style={{ backgroundColor: this.props.search.color }}>
                <h3>Technicals</h3>
                <div className='grid-3 technicals-grid' style={{ marginBottom: "15px" }}>
                    <div >
                        <h5 className='unbold' >TECHNICAL</h5>
                    </div>
                    <div >
                        <h5 className='unbold' style={{ textAlign: "right" }}>VALUE</h5>
                    </div>
                    <div >
                        <h5 className='unbold' style={{ textAlign: "right" }}>RATING</h5>
                    </div>
                </div>
                {technicals.map(t => (
                    <div className='grid-3 technicals-grid' style={{ marginBottom: "15px" }}>
                        <div >
                            <h5 style={{ fontWeight: 'normal' }}>{t.name}<small className='descriptor'>{t.descriptor}</small></h5>
                        </div>
                        <div >
                            <h5 style={{ fontWeight: "normal", textAlign: "right" }}>{t.value}</h5>
                        </div>
                        <div >
                            <h5 style={{ fontWeight: "normal", textAlign: "right", color: t.color }}>{t.rating}</h5>
                        </div>
                    </div>
                ))}
                <br />
                <br />
                <div className='grid-3 technicals-grid' style={{ marginBottom: "15px" }}>
                    <div >
                        <h5 className='unbold'>TREND STRENGTH</h5>
                    </div>
                    <div >
                        <h5 className='unbold' style={{ textAlign: "right" }}>VALUE</h5>
                    </div>
                    <div >
                        <h5 className='unbold' style={{ textAlign: "right" }}>RATING</h5>
                    </div>
                </div>
                {trendStrength.map(t => (
                    <div className='grid-3 technicals-grid' style={{ marginBottom: "15px" }}>
                        <div >
                            <h5 style={{ fontWeight: 'normal' }}>{t.name}<small className='descriptor'>{t.descriptor}</small></h5>
                        </div>
                        <div >
                            <h5 style={{ fontWeight: "normal", textAlign: "right" }}>{t.value}</h5>
                        </div>
                        <div >
                            <h5 style={{ fontWeight: "normal", textAlign: "right", color: t.color }}>{t.rating}</h5>
                        </div>
                    </div>
                ))}
                <br />
            </div >
        )
    }
}

export default Technicals;
