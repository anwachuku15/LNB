import React, { Component, useEffect, useState, cloneElement, Children } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import Colors from '../../constants/Colors'
import { useColorScheme } from 'react-native-appearance'


const TaggedUserText = props => {
    const scheme = useColorScheme()
    let text
    if (scheme === 'dark') {
        text = 'white'
    } 
    if (scheme === 'light') {
        text = 'black'
    }

    const { item, children } = props

    useEffect(() => {
        if (item.taggedUsers) {
            let i = 0
            // let patt = new RegExp(name)
            item.taggedUsers.forEach(user => {
                const name = user.name
                const bodyLength = children[i].length
                const nameLength = name.length
                const index = children[i].indexOf(name)
                const tagSubstring = children[i].substring(index, index+nameLength)
                i++
            })
        }
    }, [])

    

    const TextChildren = () => (
        <Text style={{color:text}}>
            {children}
        </Text>
    )

    const func = (children) => {
        let elements = []
        React.Children.map(children, (child) => {
            // If Hyperlink
            
            if (child) {
                console.log('hello')
                let _lastIndex = 0
                let normalStart = 0
                
                const finalMention = item.taggedUsers[item.taggedUsers.length - 1].name
                const finalLength = finalMention.length
                const finalStart = child.indexOf(finalMention)
                const finalEnd = finalStart + finalLength - 1
                const endOfChild = child.length - 1
                let key = 0
                item.taggedUsers.forEach(user => {
                    if (child.includes(user.name)) {
                        const nameLength = user.name.length
                        const start = child.indexOf(user.name)
                        const end = start + nameLength
                        if (start > 0) {
                            const normalText = child.substring(normalStart, start)
                            elements.push(<Text key={key} style={{color:text}}>{normalText}</Text>)
                            key++
                            const mentionText = child.substring(start, end)
                            elements.push(<Text key={key} style={{color:Colors.primary}}>{mentionText}</Text>)
                            key++
                        }
                        if ((end === finalEnd) && (end !== endOfChild)) {
                            normalStart = end + 1
                            const finalNormalText = child.substring(normalStart)
                            elements.push(<Text key={key} style={{color:Colors.primary}}>{finalNormalText}</Text>)
                            key++
                        }
                    }
                })
                
            }
        })
        // return children
        return React.cloneElement(TextChildren, [], elements)
    }

    return (
        // <Text>
            func(children)
        // </Text>
    )
    
}

const styles = StyleSheet.create({
    
})

export default TaggedUserText
