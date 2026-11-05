using AppleStore.Application.Auth;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace AppleStore.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();
        return services;
    }
}
