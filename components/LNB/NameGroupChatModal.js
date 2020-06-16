import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import {
    StyleSheet,
    View, 
    Text, 
    TextInput,
    Modal
} from 'react-native'
import TouchableCmp from './TouchableCmp'
import Colors from '../../constants/Colors'



const NameGroupChatModal = props => {
    const { isVisible, updateGroupName, groupName, navToGroupChatScreen, chatMembers, cancel } = props

    return (
        <Modal
            animationType='slide'
            visible={isVisible}
            transparent={true}
        >
            <View style={{...styles.modal, height: 500}}>
                <View style={styles.modalContent}>
                    <Text style={{margin: 10, fontSize: 18, fontWeight:'bold', color:'black', alignSelf:'center'}}>Group Chat Name</Text>
                    <TextInput
                        style={{color:'black', fontSize: 16, alignSelf:'center', marginVertical: 10}}
                        autoFocus
                        autoCapitalize='words'
                        maxLength={36}
                        onChangeText={text => updateGroupName(text)}
                        value={groupName}
                    />
                    <View style={{flexDirection:'row', marginTop: 10, marginHorizontal: 20, justifyContent:'space-between'}}>
                        <TouchableCmp style={styles.cancelButton} onPress={cancel}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableCmp>
                        <TouchableCmp
                            disabled={!groupName.trim().length}
                            style={{...styles.createButton, backgroundColor: !groupName.trim().length ? Colors.disabled : Colors.green}}
                            onPress={() => {navToGroupChatScreen(chatMembers, groupName)}}
                        >
                            <Text style={styles.createText}>Create</Text>
                        </TouchableCmp>
                    </View>
                </View> 
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.primaryLight, 
        // borderTopLeftRadius: 8,
        // borderTopRightRadius: 8,
        borderRadius: 8,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 400
    },
    cancelButton: {
        // flex: 1,
        width: '40%',
        backgroundColor: Colors.raspberry,
        padding: 10,
        borderRadius: 50,
    },
    cancelText: {
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    createButton: {
        // flex: 1,
        width: '40%',
        padding: 10,
        borderRadius: 50,
    },
    createText: {
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'center'
    },
})

export default NameGroupChatModal