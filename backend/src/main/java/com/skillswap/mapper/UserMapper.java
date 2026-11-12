package com.skillswap.mapper;

import com.skillswap.dto.UserDto;
import com.skillswap.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    UserDto toDto(User user);

    void updateUserFromDto(UserDto dto, @MappingTarget User user);
}
