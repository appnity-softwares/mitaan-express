import React, { useState } from 'react';
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';

const TransliteratedInput = ({
    value,
    onChange,
    enabled,
    placeholder,
    className,
    isTextArea = false,
    rows = 3,
    ...props
}) => {

    // Internal handler to match standard e.target.value pattern if needed?
    // Actually ReactTransliterate's onChange gives (text) directly.
    // We will standardise to pass just text to parent.

    if (enabled) {
        return (
            <div className="transliterate-wrapper">
                <ReactTransliterate
                    value={value}
                    onChangeText={(text) => {
                        onChange({ target: { name: props.name, value: text } });
                    }}
                    lang="hi"
                    placeholder={placeholder}
                    renderComponent={(inputProps) =>
                        isTextArea ?
                            <textarea {...inputProps} {...props} className={className} rows={rows} /> :
                            <input {...inputProps} {...props} className={className} />
                    }
                />
            </div>
        );
    }

    // Standard Input/Textarea when disabled
    return isTextArea ? (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            rows={rows}
            {...props}
        />
    ) : (
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            {...props}
        />
    );
};

export default TransliteratedInput;
